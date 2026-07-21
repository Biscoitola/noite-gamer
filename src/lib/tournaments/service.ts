import { prisma } from "@/lib/db";
import { generateSingleEliminationBracket, recordWinner } from "./bracket";

export async function ensureTournamentForGame(gameId: string, onlyCheckedIn = false) {
  const game = await prisma.game.findUniqueOrThrow({ where: { id: gameId }, include: { event: true } });
  return prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.upsert({
      where: { eventId_gameId: { eventId: game.eventId, gameId } },
      update: {},
      create: { eventId: game.eventId, gameId, name: game.name, status: "DRAFT" }
    });
    const items = await tx.registrationItem.findMany({
      where: {
        gameId,
        status: { in: ["CONFIRMED", "RESERVED"] },
        registration: { status: "CONFIRMADA" },
        ...(onlyCheckedIn ? { checkIns: { some: { canceledAt: null } } } : {})
      },
      include: { registration: { include: { participant: true } }, entries: true, checkIns: true }
    });
    const existingEntries = await tx.tournamentEntry.findMany({
      where: { tournamentId: tournament.id },
      select: { seed: true, registrationItemId: true }
    });
    const existingItemIds = new Set(existingEntries.map((entry) => entry.registrationItemId));
    const maxSeed = existingEntries.reduce((current, entry) => Math.max(current, entry.seed), 0);
    await tx.tournamentEntry.createMany({
      data: items
        .filter((item) => !existingItemIds.has(item.id))
        .map((item, index) => ({
          tournamentId: tournament.id,
          registrationItemId: item.id,
          participantId: item.registration.participantId,
          seed: maxSeed + index + 1,
          checkedIn: item.checkIns?.some((checkIn) => checkIn.canceledAt === null) ?? false
        })),
      skipDuplicates: true
    });
    const entries = await tx.tournamentEntry.findMany({
      where: { tournamentId: tournament.id },
      include: { participant: true },
      orderBy: { seed: "asc" }
    });
    const bracket = generateSingleEliminationBracket(entries.map((entry) => ({ id: entry.id, seed: entry.seed, publicName: entry.participant.publicName })));
    await tx.match.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.tournamentRound.deleteMany({ where: { tournamentId: tournament.id } });
    const roundMap = new Map<number, string>();
    for (const round of bracket.rounds) {
      const created = await tx.tournamentRound.create({ data: { tournamentId: tournament.id, number: round.number, name: round.name, order: round.order } });
      roundMap.set(round.number, created.id);
    }
    const createdMatchIds = new Map<string, string>();
    for (const match of bracket.matches) {
      const created = await tx.match.create({
        data: {
          tournamentId: tournament.id,
          roundId: roundMap.get(match.round)!,
          position: match.position,
          participant1EntryId: match.participant1EntryId,
          participant2EntryId: match.participant2EntryId,
          winnerEntryId: match.winnerEntryId,
          status: match.status
        }
      });
      createdMatchIds.set(match.id, created.id);
    }
    for (const match of bracket.matches.filter((item) => item.nextMatchId)) {
      await tx.match.update({
        where: { id: createdMatchIds.get(match.id)! },
        data: { nextMatchId: createdMatchIds.get(match.nextMatchId!), nextSlot: match.nextSlot }
      });
    }
    await tx.tournament.update({
      where: { id: tournament.id },
      data: { status: "PUBLISHED", public: true, bracketSize: bracket.bracketSize, generatedAt: new Date() }
    });
    return tournament.id;
  });
}

export async function ensurePublicTournamentForGameSlug(slug: string) {
  const game = await prisma.game.findFirstOrThrow({ where: { slug, isActive: true }, include: { event: true } });
  const confirmedCount = await prisma.registrationItem.count({
    where: { gameId: game.id, status: { in: ["CONFIRMED", "RESERVED"] }, registration: { status: "CONFIRMADA" } }
  });
  if (confirmedCount < 1) return null;
  const existingTournament = await prisma.tournament.findUnique({
    where: { eventId_gameId: { eventId: game.eventId, gameId: game.id } },
    include: { _count: { select: { matches: { where: { status: "FINISHED" } } } } }
  });
  if (existingTournament && (existingTournament.status === "STARTED" || existingTournament.status === "FINISHED" || existingTournament._count.matches > 0)) {
    return game.slug;
  }
  await ensureTournamentForGame(game.id);
  return game.slug;
}

export async function registerMatchWinner(matchId: string, winnerEntryId: string, scoreData?: object) {
  return prisma.$transaction(async (tx) => {
    const tournamentMatch = await tx.match.findUniqueOrThrow({ where: { id: matchId }, include: { tournament: { include: { matches: true } } } });
    if (!tournamentMatch.participant1EntryId || !tournamentMatch.participant2EntryId) throw new Error("Partida incompleta.");
    const pure = tournamentMatch.tournament.matches.map((match) => ({
      id: match.id,
      round: 0,
      position: match.position,
      participant1EntryId: match.participant1EntryId,
      participant2EntryId: match.participant2EntryId,
      winnerEntryId: match.winnerEntryId,
      nextMatchId: match.nextMatchId,
      nextSlot: match.nextSlot as 1 | 2 | null,
      status: match.status as "PENDING" | "READY" | "BYE" | "FINISHED"
    }));
    recordWinner(pure, matchId, winnerEntryId);
    const updated = pure.find((match) => match.id === matchId)!;
    await tx.match.update({
      where: { id: matchId, version: tournamentMatch.version },
      data: {
        winnerEntryId,
        loserEntryId: winnerEntryId === tournamentMatch.participant1EntryId ? tournamentMatch.participant2EntryId : tournamentMatch.participant1EntryId,
        status: "FINISHED",
        scoreData: scoreData ?? {},
        finishedAt: new Date(),
        version: { increment: 1 }
      }
    });
    if (updated.nextMatchId) {
      const data = updated.nextSlot === 1 ? { participant1EntryId: winnerEntryId } : { participant2EntryId: winnerEntryId };
      const nextMatch = await tx.match.update({ where: { id: updated.nextMatchId }, data });
      if (nextMatch.participant1EntryId && nextMatch.participant2EntryId && nextMatch.status === "PENDING") {
        await tx.match.update({ where: { id: nextMatch.id }, data: { status: "READY" } });
      }
    } else {
      await tx.tournament.update({ where: { id: tournamentMatch.tournamentId }, data: { status: "FINISHED", finishedAt: new Date(), championEntryId: winnerEntryId } });
    }
  });
}
