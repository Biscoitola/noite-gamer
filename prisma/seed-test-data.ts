import { PrismaClient } from "@prisma/client";
import { generateSingleEliminationBracket } from "../src/lib/tournaments/bracket";

const prisma = new PrismaClient();

const nicknames = {
  "fifa-23": [
    "GoleiroRoxo",
    "FintaMestre",
    "Canhota90",
    "TikiTaka",
    "PressaoAlta",
    "CraqueHARP",
    "GolRelampago",
    "ZagueiroBrabo",
    "Panenka",
    "TapejaraFC",
    "ChuteColocado",
    "CapitaoFIFA"
  ],
  "mortal-kombat": [
    "FatalNeon",
    "KomboRei",
    "ScorpionRS",
    "SubZeroHARP",
    "RaidenRush",
    "Brutality",
    "LiuKangue",
    "KitanaX",
    "NoobMaster",
    "Flawless",
    "FinishHim",
    "ArenaMK"
  ],
  "guitar-hero": [
    "PalhetaFuria",
    "SoloNeon",
    "StarPower",
    "RiffTapejara",
    "ComboX",
    "GuitarraRoxa",
    "HardMode",
    "NotaPerfeita",
    "RockHARP",
    "WhammyKing",
    "Setlist",
    "LendaGH"
  ]
} as const;

async function main() {
  const event = await prisma.event.findFirst({
    where: { status: "ACTIVE" },
    include: { games: true },
    orderBy: { startsAt: "desc" }
  });
  if (!event) throw new Error("Crie uma edicao ativa antes de rodar o seed de teste.");

  for (const game of event.games) {
    const names = nicknames[game.slug as keyof typeof nicknames] ?? Array.from({ length: 12 }, (_, index) => `${game.name} Player ${index + 1}`);
    for (const [index, publicName] of names.entries()) {
      const protocol = `TEST-${game.slug}-${String(index + 1).padStart(2, "0")}`;
      const existing = await prisma.registration.findUnique({ where: { protocol } });
      if (existing) continue;

      const participant = await prisma.participant.create({
        data: {
          fullName: `Teste ${publicName}`,
          publicName,
          whatsapp: `(54) 98888-${String(1000 + index)}`,
          normalizedWhatsapp: `555498888${String(1000 + index)}`,
          email: `${publicName.toLowerCase()}@teste.local`,
          city: index % 2 === 0 ? "Tapejara" : "Ibipora",
          publicId: `test-${game.slug}-${index + 1}`,
          accessTokenHash: `test-token-${game.slug}-${index + 1}`,
          consentTermsAt: new Date(),
          consentPrivacyAt: new Date(),
          consentImageAt: new Date()
        }
      });

      await prisma.registration.create({
        data: {
          eventId: event.id,
          participantId: participant.id,
          status: "CONFIRMADA",
          totalAmount: game.price,
          protocol,
          publicTokenHash: `test-public-token-${game.slug}-${index + 1}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
          confirmedAt: new Date(),
          items: {
            create: {
              gameId: game.id,
              unitPrice: game.price,
              finalPrice: game.price,
              status: "CONFIRMED"
            }
          },
          payments: {
            create: {
              provider: "fake",
              externalId: `test-payment-${game.slug}-${index + 1}`,
              idempotencyKey: `test-idem-${game.slug}-${index + 1}`,
              status: "PAGO",
              amount: game.price,
              qrCodeImage: "data:image/svg+xml;base64,",
              qrCodeText: "PIX-FAKE-TESTE",
              expiresAt: new Date(Date.now() + 60 * 60_000),
              paidAt: new Date()
            }
          }
        }
      });
    }

    await publishTournament(event.id, game.id, game.name);
  }
}

async function publishTournament(eventId: string, gameId: string, gameName: string) {
  const tournament = await prisma.tournament.upsert({
    where: { eventId_gameId: { eventId, gameId } },
    update: {
      name: gameName,
      status: "PUBLISHED",
      public: true,
      championEntryId: null,
      runnerUpEntryId: null,
      thirdPlaceEntryId: null,
      finishedAt: null
    },
    create: {
      eventId,
      gameId,
      name: gameName,
      status: "PUBLISHED",
      public: true
    }
  });

  await prisma.match.deleteMany({ where: { tournamentId: tournament.id } });
  await prisma.tournamentRound.deleteMany({ where: { tournamentId: tournament.id } });
  await prisma.tournamentEntry.deleteMany({ where: { tournamentId: tournament.id } });

  const items = await prisma.registrationItem.findMany({
    where: { gameId, status: "CONFIRMED", registration: { status: "CONFIRMADA" } },
    include: { registration: { include: { participant: true } } },
    orderBy: { createdAt: "asc" },
    take: 16
  });

  const entries = [];
  for (const [index, item] of items.entries()) {
    const entry = await prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament.id,
        registrationItemId: item.id,
        participantId: item.registration.participantId,
        seed: index + 1,
        checkedIn: index < 8
      },
      include: { participant: true }
    });
    entries.push(entry);
  }

  const bracket = generateSingleEliminationBracket(entries.map((entry) => ({
    id: entry.id,
    seed: entry.seed,
    publicName: entry.participant.publicName
  })));

  const roundIds = new Map<number, string>();
  for (const round of bracket.rounds) {
    const created = await prisma.tournamentRound.create({
      data: { tournamentId: tournament.id, number: round.number, name: round.name, order: round.order }
    });
    roundIds.set(round.number, created.id);
  }

  const matchIds = new Map<string, string>();
  for (const match of bracket.matches) {
    const created = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        roundId: roundIds.get(match.round)!,
        position: match.position,
        participant1EntryId: match.participant1EntryId,
        participant2EntryId: match.participant2EntryId,
        winnerEntryId: match.winnerEntryId,
        status: match.status
      }
    });
    matchIds.set(match.id, created.id);
  }

  for (const match of bracket.matches.filter((item) => item.nextMatchId)) {
    await prisma.match.update({
      where: { id: matchIds.get(match.id)! },
      data: { nextMatchId: matchIds.get(match.nextMatchId!)!, nextSlot: match.nextSlot }
    });
  }

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { status: "PUBLISHED", public: true, bracketSize: bracket.bracketSize, generatedAt: new Date() }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
