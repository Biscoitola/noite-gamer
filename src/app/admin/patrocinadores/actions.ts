"use server";

import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createSponsorAction(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") || "");
  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  if (!eventId || !name || !logoUrl) throw new Error("Informe evento, nome e logo do patrocinador.");

  await prisma.sponsor.create({
    data: {
      eventId,
      name,
      logoUrl,
      description: String(formData.get("description") || "Patrocinador da Noite Gamer."),
      websiteUrl: String(formData.get("websiteUrl") || "").trim() || null,
      isActive: formData.get("isActive") === "on"
    }
  });
  revalidateSponsorPages();
}

export async function createPrizeAction(formData: FormData) {
  await requireAdmin();
  const sponsorId = String(formData.get("sponsorId") || "");
  const sponsor = await prisma.sponsor.findUniqueOrThrow({ where: { id: sponsorId } });
  const title = String(formData.get("title") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (!title || !imageUrl) throw new Error("Informe titulo e imagem do brinde.");

  await prisma.prize.create({
    data: {
      eventId: sponsor.eventId,
      sponsorId,
      title,
      imageUrl,
      description: String(formData.get("description") || "Brinde do patrocinador."),
      quantity: Number(formData.get("quantity") || 1),
      isActive: formData.get("isActive") === "on"
    }
  });
  revalidateSponsorPages();
}

export async function drawPrizeAction(formData: FormData) {
  await requireAdmin();
  const prizeId = String(formData.get("prizeId") || "");
  const prize = await prisma.prize.findUniqueOrThrow({ where: { id: prizeId } });
  const registrations = await prisma.registration.findMany({
    where: {
      eventId: prize.eventId,
      status: "CONFIRMADA"
    },
    include: { participant: true },
    orderBy: { createdAt: "asc" }
  });
  if (registrations.length === 0) throw new Error("Nao ha inscricoes confirmadas para sortear.");

  const winner = registrations[randomInt(registrations.length)];
  await prisma.prize.update({
    where: { id: prize.id },
    data: { winnerRegistrationId: winner.id, drawnAt: new Date() }
  });
  revalidateSponsorPages();
}

export async function clearPrizeWinnerAction(formData: FormData) {
  await requireAdmin();
  await prisma.prize.update({
    where: { id: String(formData.get("prizeId") || "") },
    data: { winnerRegistrationId: null, drawnAt: null }
  });
  revalidateSponsorPages();
}

function revalidateSponsorPages() {
  revalidatePath("/admin/patrocinadores");
  revalidatePath("/patrocinadores");
  revalidatePath("/sorteios");
  revalidatePath("/minha-inscricao");
}
