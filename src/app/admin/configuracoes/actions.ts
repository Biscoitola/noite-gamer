"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  DEFAULT_HERO_POSTER_URL,
  DEFAULT_HOME_CAROUSEL_CONFIG,
  HOME_CAROUSEL_KEY,
  HOME_HERO_POSTER_KEY,
  isAllowedImageSource,
  isAllowedOptionalLink,
  parseHomeCarouselConfig
} from "@/lib/home-settings";

export async function createEditionAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const name = String(formData.get("name") || "Nexus Arena");
  const edition = String(formData.get("edition") || "Nova edicao");
  const startsAt = buildLocalDateTime(formData, "eventDate", "eventTime", "19:00");
  const registrationStartsAt = buildLocalDateTime(formData, "registrationStartDate", "registrationStartTime", "08:00", startsAt);
  const registrationEndsAt = buildLocalDateTime(formData, "registrationEndDate", "registrationEndTime", "23:59", startsAt);
  const status = formData.get("status") === "ACTIVE" ? "ACTIVE" : "DRAFT";
  const commerceSettings = parseCommerceForm(formData);
  await prisma.$transaction(async (tx) => {
    if (status === "ACTIVE") {
      await tx.event.updateMany({
        where: { status: "ACTIVE" },
        data: { status: "DRAFT" }
      });
    }
    await tx.event.create({
      data: {
        name,
        edition,
        description: String(formData.get("description") || "Edicao configuravel da Nexus Arena."),
        venue: String(formData.get("venue") || "HARP"),
        address: String(formData.get("address") || "Endereco a definir"),
        city: String(formData.get("city") || "Tapejara"),
        state: String(formData.get("state") || "RS"),
        startsAt,
        registrationStartsAt,
        registrationEndsAt,
        status,
        settings: {
          ...commerceSettings,
          paymentExpiresInMinutes: 30,
          emailRequired: false,
          imageConsentRequired: false,
          theme: "nexus-arena"
        }
      }
    });
  });
  revalidateEventPages();
  redirectWithConfigMessage("success", "Edicao criada.");
}

export async function updateEditionCommerceAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const eventId = String(formData.get("eventId") || "");
  const commerceSettings = parseCommerceForm(formData);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) redirectWithConfigMessage("error", "Edicao nao encontrada.");
  const settings = event.settings && typeof event.settings === "object" && !Array.isArray(event.settings) ? event.settings : {};
  await prisma.event.update({ where: { id: eventId }, data: { settings: { ...settings, ...commerceSettings } } });
  revalidateEventPages();
  redirectWithConfigMessage("success", "Combo e premiacao atualizados. Inscricoes existentes mantem seus valores.");
}

function parseCommerceForm(formData: FormData) {
  const readNumber = (key: string, max: number) => {
    const raw = String(formData.get(key) ?? "").trim().replace(",", ".");
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || value < 0 || value > max || Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) {
      redirectWithConfigMessage("error", "Informe valores validos para o combo e o percentual, com ate duas casas decimais.");
    }
    return value;
  };
  return {
    comboEnabled: formData.get("comboEnabled") === "on",
    comboPrice: readNumber("comboPrice", 999999.99),
    showPrizePool: formData.get("showPrizePool") === "on",
    prizePoolPercent: readNumber("prizePoolPercent", 100)
  };
}

export async function toggleEditionStatusAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const eventId = String(formData.get("eventId") || "");
  const isActive = formData.get("isActive") === "true";
  if (!eventId) redirectWithConfigMessage("error", "Edicao invalida.");

  await prisma.$transaction(async (tx) => {
    if (isActive) {
      await tx.event.updateMany({
        where: { status: "ACTIVE", id: { not: eventId } },
        data: { status: "DRAFT" }
      });
    }
    await tx.event.update({
      where: { id: eventId },
      data: { status: isActive ? "ACTIVE" : "DRAFT" }
    });
  });

  revalidateEventPages();
  redirectWithConfigMessage("success", isActive ? "Edicao ativada na home." : "Edicao desativada.");
}

export async function deleteEditionAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const eventId = String(formData.get("eventId") || "");
  const confirmed = formData.get("confirmDelete") === "on";
  if (!eventId) redirectWithConfigMessage("error", "Edicao invalida.");
  if (!confirmed) redirectWithConfigMessage("error", "Marque a confirmacao antes de excluir a edicao.");

  await prisma.event.delete({ where: { id: eventId } });

  revalidateEventPages();
  redirectWithConfigMessage("success", "Edicao excluida.");
}

export async function createGameAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const eventId = String(formData.get("eventId"));
  const name = String(formData.get("name"));
  const slug = slugify(String(formData.get("slug") || name));
  await prisma.game.create({
    data: {
      eventId,
      name,
      slug,
      description: String(formData.get("description") || `${name} na Nexus Arena`),
      price: Number(formData.get("price") || 0),
      capacity: Number(formData.get("capacity") || 16),
      teamMode: formData.get("teamMode") === "DOUBLES" ? "DOUBLES" : "SOLO",
      isActive: formData.get("isActive") === "on",
      rules: { text: "Regras configuraveis pelo administrador." },
      resultSchema: { simple: true }
    }
  });
  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
  revalidatePath("/inscricao");
}

export async function updateGameAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const gameId = String(formData.get("gameId") || "");
  const name = String(formData.get("name") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  if (!gameId || !name) throw new Error("Jogo invalido.");

  await prisma.game.update({
    where: { id: gameId },
    data: {
      name,
      slug: slugify(rawSlug || name),
      description: String(formData.get("description") || `${name} na Nexus Arena`),
      price: Number(formData.get("price") || 0),
      capacity: Number(formData.get("capacity") || 16),
      teamMode: formData.get("teamMode") === "DOUBLES" ? "DOUBLES" : "SOLO",
      isActive: formData.get("isActive") === "on"
    }
  });

  revalidateGamePages();
}

export async function toggleGameStatusAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const gameId = String(formData.get("gameId") || "");
  const isActive = formData.get("isActive") === "true";
  await prisma.game.update({
    where: { id: gameId },
    data: { isActive }
  });
  revalidateGamePages();
}

export async function deleteGameAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const gameId = String(formData.get("gameId") || "");
  const [registrationItems, tournaments] = await Promise.all([
    prisma.registrationItem.count({ where: { gameId } }),
    prisma.tournament.count({ where: { gameId } })
  ]);

  if (registrationItems > 0 || tournaments > 0) {
    await prisma.game.update({
      where: { id: gameId },
      data: { isActive: false }
    });
  } else {
    await prisma.game.delete({ where: { id: gameId } });
  }

  revalidateGamePages();
}

export async function updateHomeHeroPosterAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (imageUrl && !isAllowedImageSource(imageUrl)) {
    redirectWithConfigMessage("error", "Use uma URL publica https:// ou um caminho interno iniciado com /.");
  }

  await prisma.systemSetting.upsert({
    where: { key: HOME_HERO_POSTER_KEY },
    update: { value: imageUrl || DEFAULT_HERO_POSTER_URL },
    create: { key: HOME_HERO_POSTER_KEY, value: imageUrl || DEFAULT_HERO_POSTER_URL }
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
  redirectWithConfigMessage("success", "Imagem principal atualizada.");
}

export async function updateHomeCarouselSettingsAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const config = await getHomeCarouselConfig();
  config.speedSeconds = Number(formData.get("speedSeconds") || DEFAULT_HOME_CAROUSEL_CONFIG.speedSeconds);
  await saveHomeCarouselConfig(config);
  redirectWithConfigMessage("success", "Configuracao do carrossel atualizada.");
}

export async function createHomeCarouselImageAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const title = String(formData.get("title") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const linkUrl = String(formData.get("linkUrl") || "").trim();
  if (!title || !imageUrl) {
    redirectWithConfigMessage("error", "Informe titulo e URL da imagem do carrossel.");
  }
  if (!isAllowedImageSource(imageUrl)) {
    redirectWithConfigMessage("error", "Cole uma URL publica https:// da imagem. Arquivo local ou imagem copiada nao funciona em producao.");
  }
  if (!isAllowedOptionalLink(linkUrl)) {
    redirectWithConfigMessage("error", "O link deve ser https://, http://, um caminho iniciado com / ou ficar vazio.");
  }

  const config = await getHomeCarouselConfig();
  config.images.push({
    id: randomUUID(),
    title,
    imageUrl,
    linkUrl,
    order: Number(formData.get("order") || 0),
    isActive: formData.get("isActive") === "on"
  });
  await saveHomeCarouselConfig(config);
  redirectWithConfigMessage("success", "Imagem adicionada ao carrossel.");
}

export async function updateHomeCarouselImageAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const imageId = String(formData.get("imageId") || "");
  const title = String(formData.get("title") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const linkUrl = String(formData.get("linkUrl") || "").trim();
  if (!imageId || !title || !imageUrl) {
    redirectWithConfigMessage("error", "Imagem do carrossel invalida.");
  }
  if (!isAllowedImageSource(imageUrl)) {
    redirectWithConfigMessage("error", "Cole uma URL publica https:// da imagem. Arquivo local ou imagem copiada nao funciona em producao.");
  }
  if (!isAllowedOptionalLink(linkUrl)) {
    redirectWithConfigMessage("error", "O link deve ser https://, http://, um caminho iniciado com / ou ficar vazio.");
  }

  const config = await getHomeCarouselConfig();
  config.images = config.images.map((image) => image.id === imageId
    ? {
        ...image,
        title,
        imageUrl,
        linkUrl,
        order: Number(formData.get("order") || 0),
        isActive: formData.get("isActive") === "on"
      }
    : image);
  await saveHomeCarouselConfig(config);
  redirectWithConfigMessage("success", "Imagem do carrossel atualizada.");
}

export async function deleteHomeCarouselImageAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const imageId = String(formData.get("imageId") || "");
  const config = await getHomeCarouselConfig();
  config.images = config.images.filter((image) => image.id !== imageId);
  await saveHomeCarouselConfig(config);
  redirectWithConfigMessage("success", "Imagem removida do carrossel.");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function revalidateGamePages() {
  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/check-in");
  revalidatePath("/admin/torneios");
  revalidatePath("/admin/relatorios/inscritos");
  revalidatePath("/");
  revalidatePath("/inscricao");
  revalidatePath("/torneios");
}

function revalidateEventPages() {
  revalidateGamePages();
  revalidatePath("/admin/patrocinadores");
  revalidatePath("/admin/cupons");
  revalidatePath("/admin/sorteios");
  revalidatePath("/patrocinadores");
  revalidatePath("/premios");
  revalidatePath("/sorteios");
}

function buildLocalDateTime(
  formData: FormData,
  dateKey: string,
  timeKey: string,
  fallbackTime: string,
  fallbackDate?: Date
) {
  const rawDate = String(formData.get(dateKey) || "");
  const rawTime = String(formData.get(timeKey) || fallbackTime);
  if (!rawDate && fallbackDate) return fallbackDate;
  const date = rawDate || new Date().toISOString().slice(0, 10);
  const parsed = new Date(`${date}T${rawTime || fallbackTime}:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Data invalida. Informe data e horario completos.");
  }
  return parsed;
}

async function getHomeCarouselConfig() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: HOME_CAROUSEL_KEY } });
  return parseHomeCarouselConfig(setting?.value);
}

async function saveHomeCarouselConfig(config: Awaited<ReturnType<typeof getHomeCarouselConfig>>) {
  const cleanConfig = parseHomeCarouselConfig(config);
  await prisma.systemSetting.upsert({
    where: { key: HOME_CAROUSEL_KEY },
    update: { value: cleanConfig },
    create: { key: HOME_CAROUSEL_KEY, value: cleanConfig }
  });
  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
}

function redirectWithConfigMessage(type: "success" | "error", message: string): never {
  redirect(`/admin/configuracoes?${type}=${encodeURIComponent(message)}`);
}
