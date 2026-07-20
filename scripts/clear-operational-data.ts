import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany();
    await tx.checkIn.deleteMany();
    await tx.match.deleteMany();
    await tx.tournamentRound.deleteMany();
    await tx.tournamentEntry.deleteMany();
    await tx.tournament.deleteMany();
    await tx.paymentWebhook.deleteMany();
    await tx.payment.deleteMany();
    await tx.registrationItem.deleteMany();
    await tx.registration.deleteMany();
    await tx.participant.deleteMany();
  });

  const remaining = {
    participants: await prisma.participant.count(),
    registrations: await prisma.registration.count(),
    payments: await prisma.payment.count(),
    tournaments: await prisma.tournament.count(),
    games: await prisma.game.count(),
    events: await prisma.event.count(),
    admins: await prisma.adminUser.count()
  };

  console.log("Dados operacionais removidos.");
  console.table(remaining);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
