"use server";

import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createSponsorAction(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") || "");
  const name = String(formData.get("name") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  if (!eventId || !name || !logoUrl) throw new Error("Informe evento, nome e logo do patrocinador.");

  const sponsor = await prisma.sponsor.create({
    data: {
      eventId,
      name,
      logoUrl,
      description: String(formData.get("description") || "Patrocinador da Noite Gamer."),
      websiteUrl: String(formData.get("websiteUrl") || "").trim() || null,
      carouselImageUrl: String(formData.get("carouselImageUrl") || "").trim() || null,
      showInCarousel: formData.get("showInCarousel") === "on",
      carouselOrder: Number(formData.get("carouselOrder") || 0),
      isActive: formData.get("isActive") === "on"
    }
  });
  revalidateSponsorPages(sponsor.id);
}

export async function updateSponsorCarouselAction(formData: FormData) {
  await requireAdmin();
  const sponsorId = String(formData.get("sponsorId") || "");
  const sponsor = await prisma.sponsor.update({
    where: { id: sponsorId },
    data: {
      logoUrl: String(formData.get("logoUrl") || "").trim(),
      carouselImageUrl: String(formData.get("carouselImageUrl") || "").trim() || null,
      showInCarousel: formData.get("showInCarousel") === "on",
      carouselOrder: Number(formData.get("carouselOrder") || 0),
      isActive: formData.get("isActive") === "on"
    }
  });
  revalidateSponsorPages(sponsor.id);
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
  revalidateSponsorPages(sponsorId);
}

export async function drawPrizeAction(formData: FormData) {
  await requireAdmin();
  const prizeId = String(formData.get("prizeId") || "");
  const returnTo = getReturnTo(formData);
  const prize = await prisma.prize.findUniqueOrThrow({ where: { id: prizeId } });
  const registrations = await prisma.registration.findMany({
    where: {
      eventId: prize.eventId,
      status: "CONFIRMADA"
    },
    include: { participant: true },
    orderBy: { createdAt: "asc" }
  });
  if (registrations.length === 0) {
    redirectWithMessage(returnTo, "error", "Nao ha inscricoes confirmadas para sortear.");
  }

  const winner = registrations[randomInt(registrations.length)];
  await prisma.prize.update({
    where: { id: prize.id },
    data: { winnerRegistrationId: winner.id, drawnAt: new Date() }
  });
  revalidateSponsorPages(prize.sponsorId);
  redirectWithMessage(returnTo, "success", `Sorteio realizado: ${winner.participant.publicName}.`);
}

export async function clearPrizeWinnerAction(formData: FormData) {
  await requireAdmin();
  const returnTo = getReturnTo(formData);
  const prize = await prisma.prize.update({
    where: { id: String(formData.get("prizeId") || "") },
    data: { winnerRegistrationId: null, drawnAt: null }
  });
  revalidateSponsorPages(prize.sponsorId);
  redirectWithMessage(returnTo, "success", "Ganhador removido do premio.");
}

function revalidateSponsorPages(sponsorId?: string) {
  revalidatePath("/admin/patrocinadores");
  revalidatePath("/patrocinadores");
  if (sponsorId) revalidatePath(`/patrocinadores/${sponsorId}`);
  revalidatePath("/sorteios");
  revalidatePath("/minha-inscricao");
}

function getReturnTo(formData: FormData) {
  const value = String(formData.get("returnTo") || "/admin/patrocinadores");
  return value.startsWith("/admin/") ? value : "/admin/patrocinadores";
}

function redirectWithMessage(returnTo: string, type: "success" | "error", message: string): never {
  redirect(`${returnTo}?${type}=${encodeURIComponent(message)}`);
}
