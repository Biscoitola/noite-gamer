import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security";

const prisma = new PrismaClient();
const publicAssetBaseUrl = "https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets";

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@noitegamer.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "troque-esta-senha-dev";
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_SEED_PASSWORD) {
    throw new Error("Defina ADMIN_SEED_PASSWORD antes de rodar o seed em producao.");
  }

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      isActive: true,
      lockedUntil: null,
      failedLoginAttempts: 0
    },
    create: {
      name: "Administrador Dev",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN"
    }
  });

  const event = await prisma.event.upsert({
    where: { id: "event_noite_gamer_2" },
    update: {
      name: "Nexus Arena",
      description: "Arena de competicoes gamer no HARP em Tapejara/RS."
    },
    create: {
      id: "event_noite_gamer_2",
      name: "Nexus Arena",
      edition: "2a Edicao",
      description: "Arena de competicoes gamer no HARP em Tapejara/RS.",
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

  const shouldSeedDefaultGames = process.env.SEED_DEFAULT_GAMES === "true";
  const gameData = shouldSeedDefaultGames
    ? ([
        ["FIFA 26", "fifa-26", 35, 32],
        ["Mortal Kombat", "mortal-kombat", 30, 32],
        ["Guitar Hero", "guitar-hero", 25, 24]
      ] as const)
    : [];
  for (const [name, slug, price, capacity] of gameData) {
    await prisma.game.upsert({
      where: { eventId_slug: { eventId: event.id, slug } },
      update: {},
      create: {
        eventId: event.id,
        name,
        slug,
        description: `${name} na Nexus Arena`,
        price,
        capacity,
        rules: { text: "Regras configuraveis pelo administrador." },
        resultSchema: { simple: true }
      }
    });
  }

  const sponsorData = [
    {
      name: "Bechi Acessorios",
      description: "Patrocinador oficial da Nexus Arena.",
      logoUrl: `${publicAssetBaseUrl}/sponsor-bechi-acessorios.jpeg`,
      carouselImageUrl: `${publicAssetBaseUrl}/sponsor-bechi-acessorios.jpeg`,
      carouselOrder: 1
    },
    {
      name: "GuriCell",
      description: "Celulares e assistencia tecnica apoiando a Nexus Arena.",
      logoUrl: `${publicAssetBaseUrl}/sponsor-guricell.jpeg`,
      carouselImageUrl: `${publicAssetBaseUrl}/sponsor-guricell.jpeg`,
      carouselOrder: 2
    }
  ];

  for (const sponsor of sponsorData) {
    const existingSponsor = await prisma.sponsor.findFirst({
      where: { eventId: event.id, name: sponsor.name }
    });

    if (existingSponsor) {
      await prisma.sponsor.update({
        where: { id: existingSponsor.id },
        data: {
          description: sponsor.description,
          logoUrl: sponsor.logoUrl,
          carouselImageUrl: sponsor.carouselImageUrl,
          carouselOrder: sponsor.carouselOrder,
          showInCarousel: true,
          isActive: true
        }
      });
    } else {
      await prisma.sponsor.create({
        data: {
          eventId: event.id,
          ...sponsor,
          showInCarousel: true,
          isActive: true
        }
      });
    }
  }

  const heroPosterSetting = await prisma.systemSetting.findUnique({ where: { key: "home.heroPosterUrl" } });
  const shouldSeedHeroPoster =
    !heroPosterSetting ||
    heroPosterSetting.value === "/assets/folder-noite-gamer.png" ||
    heroPosterSetting.value === "/assets/banner-fifa-26-duos.png";
  if (shouldSeedHeroPoster) {
    await prisma.systemSetting.upsert({
      where: { key: "home.heroPosterUrl" },
      update: { value: "/assets/banner-fifa-26-duos.png" },
      create: { key: "home.heroPosterUrl", value: "/assets/banner-fifa-26-duos.png" }
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
        title: "Nexus Arena",
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

  const removedThirdEditionTestRegistrations = await removeThirdEditionTestRegistrations();

  console.log(`Seed concluido: admin ${admin.email}, evento ${event.name} ${event.edition} e ${gameData.length} jogos padrao.`);
  if (removedThirdEditionTestRegistrations > 0) {
    console.log(`Inscricoes teste TEST-DUO3 removidas: ${removedThirdEditionTestRegistrations}.`);
  }
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

async function removeThirdEditionTestRegistrations() {
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
      items: { select: { id: true } }
    }
  });

  const registrationIds = registrations.map((registration) => registration.id);
  if (registrationIds.length === 0) return 0;

  const participantIds = registrations.map((registration) => registration.participantId);
  const itemIds = registrations.flatMap((registration) => registration.items.map((item) => item.id));

  await prisma.$transaction(async (tx) => {
    const tournamentEntries = await tx.tournamentEntry.findMany({
      where: { registrationItemId: { in: itemIds } },
      select: { id: true }
    });
    const entryIds = tournamentEntries.map((entry) => entry.id);

    await tx.prize.updateMany({
      where: { winnerRegistrationId: { in: registrationIds } },
      data: { winnerRegistrationId: null, drawnAt: null }
    });

    if (entryIds.length > 0) {
      await tx.match.deleteMany({
        where: {
          OR: [
            { participant1EntryId: { in: entryIds } },
            { participant2EntryId: { in: entryIds } },
            { winnerEntryId: { in: entryIds } },
            { loserEntryId: { in: entryIds } }
          ]
        }
      });
      await tx.tournamentEntry.deleteMany({ where: { id: { in: entryIds } } });
    }

    await tx.checkIn.deleteMany({ where: { registrationItemId: { in: itemIds } } });
    await tx.payment.deleteMany({ where: { registrationId: { in: registrationIds } } });
    await tx.registrationItem.deleteMany({ where: { id: { in: itemIds } } });
    await tx.registration.deleteMany({ where: { id: { in: registrationIds } } });
    await tx.participant.deleteMany({
      where: {
        id: { in: participantIds },
        publicId: { startsWith: "test-duo3-" },
        registrations: { none: {} }
      }
    });
  });

  return registrationIds.length;
}
