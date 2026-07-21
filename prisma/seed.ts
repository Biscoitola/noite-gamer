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

  const carouselSetting = await prisma.systemSetting.findUnique({ where: { key: "home.carouselConfig" } });
  const shouldSeedCarousel =
    !carouselSetting ||
    !carouselSetting.value ||
    typeof carouselSetting.value !== "object" ||
    Array.isArray(carouselSetting.value) ||
    !Array.isArray((carouselSetting.value as { images?: unknown }).images) ||
    (carouselSetting.value as { images?: unknown[] }).images?.length === 0 ||
    hasOnlyBundledCarouselImages((carouselSetting.value as { images?: unknown[] }).images);
  const defaultCarouselConfig = {
    speedSeconds: 28,
    images: [
      {
        id: "carousel-noite-gamer",
        title: "Noite Gamer",
        imageUrl: "/assets/carousel-noite-gamer.jpeg",
        linkUrl: "/inscricao",
        order: 1,
        isActive: true
      },
      {
        id: "carousel-game-comeca",
        title: "O game comeca aqui",
        imageUrl: "/assets/carousel-game-comeca.jpeg",
        linkUrl: "/inscricao",
        order: 2,
        isActive: true
      },
      {
        id: "carousel-competicao",
        title: "Competicao do seu jeito",
        imageUrl: "/assets/carousel-competicao.jpeg",
        linkUrl: "/torneios",
        order: 3,
        isActive: true
      },
      {
        id: "carousel-galera",
        title: "Traga sua galera",
        imageUrl: "/assets/carousel-galera.jpeg",
        linkUrl: "/inscricao",
        order: 4,
        isActive: true
      },
      {
        id: "carousel-noite-epica",
        title: "Sua noite epica te espera",
        imageUrl: "/assets/carousel-noite-epica.jpeg",
        linkUrl: "/inscricao",
        order: 5,
        isActive: true
      },
      {
        id: "carousel-muito-mais",
        title: "Muito mais que jogos",
        imageUrl: "/assets/carousel-muito-mais.jpeg",
        linkUrl: "/sorteios",
        order: 6,
        isActive: true
      },
      {
        id: "carousel-save-date",
        title: "Save the date",
        imageUrl: "/assets/carousel-save-date.jpeg",
        linkUrl: "/inscricao",
        order: 7,
        isActive: true
      }
    ]
  };

  if (shouldSeedCarousel) {
    await prisma.systemSetting.upsert({
      where: { key: "home.carouselConfig" },
      update: { value: defaultCarouselConfig },
      create: {
        key: "home.carouselConfig",
        value: defaultCarouselConfig
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

function hasOnlyBundledCarouselImages(images: unknown[] | undefined) {
  if (!images?.length) return false;
  return images.every((image) => {
    if (!image || typeof image !== "object" || Array.isArray(image)) return false;
    const imageUrl = (image as { imageUrl?: unknown }).imageUrl;
    return typeof imageUrl === "string" && imageUrl.startsWith("/assets/carousel-");
  });
}
