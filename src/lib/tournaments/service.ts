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
      include: { registration: { include: { participant: true } }, entries: true, checkIns: true },
      orderBy: { createdAt: "asc" }
    });
    const uniqueItems = uniqueRegistrationItemsByPlayer(items);
    await tx.match.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.tournamentRound.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.tournamentEntry.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.tournamentEntry.createMany({
      data: uniqueItems.map((item, index) => ({
        tournamentId: tournament.id,
        registrationItemId: item.id,
        participantId: item.registration.participantId,
        seed: index + 1,
        displayName: getTournamentEntryDisplayName(item),
        checkedIn: item.checkIns?.some((checkIn) => checkIn.canceledAt === null) ?? false
      })),
      skipDuplicates: true
    });
    if (uniqueItems.length < 1) {
      await tx.tournament.update({
        where: { id: tournament.id },
        data: {
          status: "DRAFT",
          public: false,
          bracketSize: null,
          generatedAt: null,
          startedAt: null,
          finishedAt: null,
          championEntryId: null,
          runnerUpEntryId: null,
          thirdPlaceEntryId: null
        }
      });
      throw new Error("Nenhum jogador com check-in confirmado para este jogo.");
    }
    const entries = await tx.tournamentEntry.findMany({
      where: { tournamentId: tournament.id },
      include: { participant: true },
      orderBy: { seed: "asc" }
    });
    const bracket = generateSingleEliminationBracket(entries.map((entry) => ({ id: entry.id, seed: entry.seed, publicName: entry.displayName ?? entry.participant.publicName })));
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
      data: {
        status: "PUBLISHED",
        public: true,
        bracketSize: bracket.bracketSize,
        generatedAt: new Date(),
        startedAt: null,
        finishedAt: null,
        championEntryId: null,
        runnerUpEntryId: null,
        thirdPlaceEntryId: null
      }
    });
    return tournament.id;
  });
}

type TournamentRegistrationItem = {
  id: string;
  teamName?: string | null;
  teammateName?: string | null;
  checkIns?: { canceledAt: Date | null }[];
  registration: {
    participantId: string;
    participant: {
      publicName: string;
      normalizedWhatsapp: string;
    };
  };
};

function getTournamentEntryDisplayName(item: TournamentRegistrationItem) {
  if (item.teamName?.trim()) return item.teamName.trim();
  if (item.teammateName?.trim()) return `${item.registration.participant.publicName} + ${item.teammateName.trim()}`;
  return item.registration.participant.publicName;
}

function uniqueRegistrationItemsByPlayer<T extends TournamentRegistrationItem>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const participant = item.registration.participant;
    const identities = [
      participant.normalizedWhatsapp ? `phone:${participant.normalizedWhatsapp}` : null,
      `name:${normalizePlayerName(participant.publicName)}`
    ].filter(Boolean) as string[];
    if (identities.some((identity) => seen.has(identity))) return false;
    identities.forEach((identity) => seen.add(identity));
    return true;
  });
}

function normalizePlayerName(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR").replace(/\s+/g, " ");
}

export async function resetTournamentState(eventId?: string) {
  return prisma.$transaction(async (tx) => {
    const tournamentWhere = eventId ? { eventId } : {};
    const tournaments = await tx.tournament.findMany({ where: tournamentWhere, select: { id: true, game: { select: { slug: true } } } });
    const tournamentIds = tournaments.map((tournament) => tournament.id);
    const gameSlugs = tournaments.map((tournament) => tournament.game.slug);

    if (tournamentIds.length > 0) {
      await tx.match.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
      await tx.tournamentRound.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
      await tx.tournamentEntry.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
      await tx.tournament.updateMany({
        where: { id: { in: tournamentIds } },
        data: {
          status: "DRAFT",
          public: false,
          bracketSize: null,
          generatedAt: null,
          startedAt: null,
          finishedAt: null,
          championEntryId: null,
          runnerUpEntryId: null,
          thirdPlaceEntryId: null
        }
      });
    }

    await tx.prize.updateMany({
      where: eventId ? { eventId } : {},
      data: { winnerRegistrationId: null, drawnAt: null }
    });

    return { gameSlugs };
  });
}

export async function resetSingleTournamentState(tournamentId: string) {
  return prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.findUniqueOrThrow({
      where: { id: tournamentId },
      select: { id: true, game: { select: { slug: true } } }
    });

    await tx.match.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.tournamentRound.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.tournamentEntry.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.tournament.update({
      where: { id: tournament.id },
      data: {
        status: "DRAFT",
        public: false,
        bracketSize: null,
        generatedAt: null,
        startedAt: null,
        finishedAt: null,
        championEntryId: null,
        runnerUpEntryId: null,
        thirdPlaceEntryId: null
      }
    });

    return { gameSlug: tournament.game.slug };
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
    include: {
      _count: {
        select: {
          matches: { where: { status: "FINISHED" } }
        }
      }
    }
  });
  if (existingTournament && (existingTournament.status === "FINISHED" || existingTournament._count.matches > 0)) {
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

export async function undoMatchWinner(matchId: string) {
  return prisma.$transaction(async (tx) => {
    const tournamentMatch = await tx.match.findUniqueOrThrow({
      where: { id: matchId },
      include: { tournament: { include: { game: true } } }
    });
    if (!tournamentMatch.winnerEntryId) {
      throw new Error("Esta partida ainda nao tem vencedor para desfazer.");
    }

    const nextMatch = tournamentMatch.nextMatchId
      ? await tx.match.findUnique({ where: { id: tournamentMatch.nextMatchId } })
      : null;
    if (nextMatch?.winnerEntryId) {
      throw new Error("Nao e possivel desfazer porque a partida seguinte ja tem vencedor.");
    }

    await tx.match.update({
      where: { id: matchId, version: tournamentMatch.version },
      data: {
        winnerEntryId: null,
        loserEntryId: null,
        status: tournamentMatch.participant1EntryId && tournamentMatch.participant2EntryId ? "READY" : "PENDING",
        scoreData: {},
        finishedAt: null,
        version: { increment: 1 }
      }
    });

    if (nextMatch && tournamentMatch.nextSlot) {
      const nextSlotEntryId = tournamentMatch.nextSlot === 1 ? nextMatch.participant1EntryId : nextMatch.participant2EntryId;
      if (nextSlotEntryId === tournamentMatch.winnerEntryId) {
        const data =
          tournamentMatch.nextSlot === 1
            ? { participant1EntryId: null, status: "PENDING" as const }
            : { participant2EntryId: null, status: "PENDING" as const };
        await tx.match.update({ where: { id: nextMatch.id }, data });
      }
    }

    if (!tournamentMatch.nextMatchId) {
      await tx.tournament.update({
        where: { id: tournamentMatch.tournamentId },
        data: {
          status: "PUBLISHED",
          finishedAt: null,
          championEntryId: null,
          runnerUpEntryId: null,
          thirdPlaceEntryId: null
        }
      });
    }

    return {
      tournamentId: tournamentMatch.tournamentId,
      gameSlug: tournamentMatch.tournament.game.slug
    };
  });
}

export async function updateMatchParticipants(matchId: string, participant1EntryId: string | null, participant2EntryId: string | null) {
  return prisma.$transaction(async (tx) => {
    const tournamentMatch = await tx.match.findUniqueOrThrow({
      where: { id: matchId },
      include: {
        tournament: {
          include: {
            entries: true,
            game: true
          }
        }
      }
    });
    const nextMatch = tournamentMatch.nextMatchId
      ? await tx.match.findUnique({ where: { id: tournamentMatch.nextMatchId } })
      : null;
    if (tournamentMatch.winnerEntryId || tournamentMatch.status === "FINISHED") {
      throw new Error("Nao e possivel trocar jogadores de uma partida finalizada.");
    }
    if (nextMatch?.winnerEntryId) {
      throw new Error("Nao e possivel trocar esta partida porque a proxima ja tem vencedor.");
    }
    if (participant1EntryId && participant2EntryId && participant1EntryId === participant2EntryId) {
      throw new Error("Escolha dois jogadores diferentes para a partida.");
    }

    const validEntryIds = new Set(tournamentMatch.tournament.entries.map((entry) => entry.id));
    for (const entryId of [participant1EntryId, participant2EntryId].filter(Boolean)) {
      if (!validEntryIds.has(entryId!)) throw new Error("Jogador nao pertence a este torneio.");
    }
    const selectedEntryIds = [participant1EntryId, participant2EntryId].filter(Boolean) as string[];
    if (selectedEntryIds.length > 0) {
      const duplicateInRound = await tx.match.findFirst({
        where: {
          tournamentId: tournamentMatch.tournamentId,
          roundId: tournamentMatch.roundId,
          id: { not: matchId },
          OR: [
            { participant1EntryId: { in: selectedEntryIds } },
            { participant2EntryId: { in: selectedEntryIds } }
          ]
        }
      });
      if (duplicateInRound) {
        throw new Error("Este jogador ja esta em outra partida desta fase.");
      }
    }

    const status = participant1EntryId && participant2EntryId ? "READY" : "PENDING";
    await tx.match.update({
      where: { id: matchId, version: tournamentMatch.version },
      data: {
        participant1EntryId,
        participant2EntryId,
        status,
        loserEntryId: null,
        scoreData: {},
        finishedAt: null,
        version: { increment: 1 }
      }
    });

    return {
      tournamentId: tournamentMatch.tournamentId,
      gameSlug: tournamentMatch.tournament.game.slug
    };
  });
}
