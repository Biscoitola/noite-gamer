"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createEditionAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "Noite Gamer");
  const edition = String(formData.get("edition") || "Nova edicao");
  const startsAt = buildLocalDateTime(formData, "eventDate", "eventTime", "19:00");
  const registrationStartsAt = buildLocalDateTime(formData, "registrationStartDate", "registrationStartTime", "08:00", startsAt);
  const registrationEndsAt = buildLocalDateTime(formData, "registrationEndDate", "registrationEndTime", "23:59", startsAt);
  await prisma.event.create({
    data: {
      name,
      edition,
      description: String(formData.get("description") || "Edicao configuravel da Noite Gamer."),
      venue: String(formData.get("venue") || "HARP"),
      address: String(formData.get("address") || "Endereco a definir"),
      city: String(formData.get("city") || "Tapejara"),
      state: String(formData.get("state") || "RS"),
      startsAt,
      registrationStartsAt,
      registrationEndsAt,
      status: formData.get("status") === "ACTIVE" ? "ACTIVE" : "DRAFT",
      settings: {
        paymentExpiresInMinutes: 30,
        emailRequired: false,
        imageConsentRequired: false,
        theme: "purple-neon"
      }
    }
  });
  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
}

export async function createGameAction(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId"));
  const name = String(formData.get("name"));
  const slug = slugify(String(formData.get("slug") || name));
  await prisma.game.create({
    data: {
      eventId,
      name,
      slug,
      description: String(formData.get("description") || `${name} na Noite Gamer`),
      price: Number(formData.get("price") || 0),
      capacity: Number(formData.get("capacity") || 16),
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
  await requireAdmin();
  const gameId = String(formData.get("gameId") || "");
  const name = String(formData.get("name") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  if (!gameId || !name) throw new Error("Jogo invalido.");

  await prisma.game.update({
    where: { id: gameId },
    data: {
      name,
      slug: slugify(rawSlug || name),
      description: String(formData.get("description") || `${name} na Noite Gamer`),
      price: Number(formData.get("price") || 0),
      capacity: Number(formData.get("capacity") || 16),
      isActive: formData.get("isActive") === "on"
    }
  });

  revalidateGamePages();
}

export async function toggleGameStatusAction(formData: FormData) {
  await requireAdmin();
  const gameId = String(formData.get("gameId") || "");
  const isActive = formData.get("isActive") === "true";
  await prisma.game.update({
    where: { id: gameId },
    data: { isActive }
  });
  revalidateGamePages();
}

export async function deleteGameAction(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (imageUrl && !isAllowedImageSource(imageUrl)) {
    throw new Error("Use uma URL completa https:// ou um caminho interno que comece com /.");
  }

  await prisma.systemSetting.upsert({
    where: { key: "home.heroPosterUrl" },
    update: { value: imageUrl || "/assets/folder-noite-gamer.png" },
    create: { key: "home.heroPosterUrl", value: imageUrl || "/assets/folder-noite-gamer.png" }
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isAllowedImageSource(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
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
