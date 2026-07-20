import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@noitegamer.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "troque-esta-senha-dev";
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_SEED_PASSWORD) {
    throw new Error("Defina ADMIN_SEED_PASSWORD antes de rodar o seed em producao.");
  }

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador Dev",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN"
    }
  });

  const event = await prisma.event.upsert({
    where: { id: "event_noite_gamer_2" },
    update: {},
    create: {
      id: "event_noite_gamer_2",
      name: "Noite Gamer",
      edition: "2a Edicao",
      description: "Torneio gamer no HARP em Tapejara/RS.",
      venue: "HARP",
      address: "Endereco configuravel",
      city: "Tapejara",
      state: "RS",
      startsAt: new Date("2026-09-20T22:00:00-03:00"),
      registrationStartsAt: new Date("2026-07-01T00:00:00-03:00"),
      registrationEndsAt: new Date("2026-09-20T18:00:00-03:00"),
      status: "ACTIVE",
      settings: { paymentExpiresInMinutes: 30, emailRequired: false, imageConsentRequired: false }
    }
  });

  const gameData = [
    ["FIFA 23", "fifa-23", 35, 32],
    ["Mortal Kombat", "mortal-kombat", 30, 32],
    ["Guitar Hero", "guitar-hero", 25, 24]
  ] as const;
  for (const [name, slug, price, capacity] of gameData) {
    await prisma.game.upsert({
      where: { eventId_slug: { eventId: event.id, slug } },
      update: {},
      create: {
        eventId: event.id,
        name,
        slug,
        description: `${name} na Noite Gamer`,
        price,
        capacity,
        rules: { text: "Regras configuraveis pelo administrador." },
        resultSchema: { simple: true }
      }
    });
  }

  console.log(`Seed concluido: admin ${admin.email}, evento ${event.name} ${event.edition} e ${gameData.length} jogos.`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
