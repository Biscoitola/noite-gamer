import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_ENV_FILE) return;

  const envPath = process.env.DATABASE_ENV_FILE ?? ".env";
  const envFile = readFileSync(envPath, "utf8");
  const envValues = Object.fromEntries(
    envFile
      .split(/\r?\n/)
      .map((line) => line.match(/^([^=#\s]+)=(?:"([^"]*)"|'([^']*)'|([^\r\n]*))/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1], match[2] ?? match[3] ?? match[4] ?? ""])
  );

  let databaseUrl = envValues.DATABASE_URL;
  const reference = databaseUrl?.match(/^\$\{?([A-Z0-9_]+)\}?$/);
  if (reference) {
    databaseUrl = envValues[reference[1]] ?? process.env[reference[1]];
  }

  if (!databaseUrl) {
    throw new Error(`DATABASE_URL nao encontrada em ${envPath}.`);
  }

  process.env.DATABASE_URL = databaseUrl;
}

loadDatabaseUrl();

const prisma = new PrismaClient();

async function main() {
  const registrations = await prisma.registration.findMany({
    where: {
      protocol: { startsWith: "TEST-DUO3-" },
      source: "test-seed",
      event: {
        OR: [
          { edition: { contains: "3", mode: "insensitive" } },
          { edition: { contains: "terce", mode: "insensitive" } }
        ]
      }
    },
    select: {
      id: true,
      participantId: true,
      protocol: true,
      items: { select: { id: true } }
    },
    orderBy: { protocol: "asc" }
  });

  const registrationIds = registrations.map((registration) => registration.id);
  const participantIds = registrations.map((registration) => registration.participantId);
  const itemIds = registrations.flatMap((registration) => registration.items.map((item) => item.id));

  if (registrationIds.length === 0) {
    console.log("Nenhuma inscricao de teste TEST-DUO3 encontrada.");
    return;
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const tournamentEntries = await tx.tournamentEntry.findMany({
      where: { registrationItemId: { in: itemIds } },
      select: { id: true }
    });
    const entryIds = tournamentEntries.map((entry) => entry.id);

    await tx.prize.updateMany({
      where: { winnerRegistrationId: { in: registrationIds } },
      data: { winnerRegistrationId: null, drawnAt: null }
    });

    const deletedMatches = entryIds.length
      ? await tx.match.deleteMany({
          where: {
            OR: [
              { participant1EntryId: { in: entryIds } },
              { participant2EntryId: { in: entryIds } },
              { winnerEntryId: { in: entryIds } },
              { loserEntryId: { in: entryIds } }
            ]
          }
        })
      : { count: 0 };

    const deletedEntries = await tx.tournamentEntry.deleteMany({
      where: { id: { in: entryIds } }
    });
    const deletedCheckIns = await tx.checkIn.deleteMany({
      where: { registrationItemId: { in: itemIds } }
    });
    const deletedPayments = await tx.payment.deleteMany({
      where: { registrationId: { in: registrationIds } }
    });
    const deletedItems = await tx.registrationItem.deleteMany({
      where: { id: { in: itemIds } }
    });
    const deletedRegistrations = await tx.registration.deleteMany({
      where: { id: { in: registrationIds } }
    });
    const deletedParticipants = await tx.participant.deleteMany({
      where: {
        id: { in: participantIds },
        publicId: { startsWith: "test-duo3-" },
        registrations: { none: {} }
      }
    });

    return {
      matches: deletedMatches.count,
      tournamentEntries: deletedEntries.count,
      checkIns: deletedCheckIns.count,
      payments: deletedPayments.count,
      registrationItems: deletedItems.count,
      registrations: deletedRegistrations.count,
      participants: deletedParticipants.count
    };
  });

  console.log(`Inscricoes removidas: ${deleted.registrations}`);
  console.table(deleted);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
