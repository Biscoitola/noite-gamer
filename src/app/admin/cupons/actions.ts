"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createCouponAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const eventId = String(formData.get("eventId") || "");
  const code = normalizeCouponCode(String(formData.get("code") || ""));
  const value = Number(formData.get("value") || 0);
  if (!eventId || !code || value <= 0) redirectWithCouponMessage("error", "Informe evento, codigo e valor do cupom.");

  const startsAt = readDateTime(formData, "startsAt") ?? new Date();
  const expiresAt = readExpiresAt(formData, startsAt);
  if (expiresAt <= startsAt) redirectWithCouponMessage("error", "A validade final precisa ser depois do inicio.");

  try {
    await prisma.discountCoupon.create({
      data: {
        eventId,
        code,
        description: String(formData.get("description") || "Cupom de desconto relampago.").trim(),
        type: String(formData.get("type")) === "FIXED" ? "FIXED" : "PERCENT",
        value,
        startsAt,
        expiresAt,
        maxUses: readOptionalInt(formData, "maxUses"),
        isActive: formData.get("isActive") === "on"
      }
    });
  } catch {
    redirectWithCouponMessage("error", "Ja existe um cupom com esse codigo nesta edicao.");
  }

  revalidateCouponPages();
  redirectWithCouponMessage("success", "Cupom cadastrado.");
}

export async function updateCouponAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const couponId = String(formData.get("couponId") || "");
  const startsAt = readDateTime(formData, "startsAt") ?? new Date();
  const expiresAt = readExpiresAt(formData, startsAt);
  if (!couponId || expiresAt <= startsAt) redirectWithCouponMessage("error", "Cupom invalido ou validade incorreta.");

  await prisma.discountCoupon.update({
    where: { id: couponId },
    data: {
      description: String(formData.get("description") || "Cupom de desconto relampago.").trim(),
      type: String(formData.get("type")) === "FIXED" ? "FIXED" : "PERCENT",
      value: Number(formData.get("value") || 0),
      startsAt,
      expiresAt,
      maxUses: readOptionalInt(formData, "maxUses"),
      isActive: formData.get("isActive") === "on"
    }
  });

  revalidateCouponPages();
  redirectWithCouponMessage("success", "Cupom atualizado.");
}

function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9_-]/g, "");
}

function readDateTime(formData: FormData, field: string) {
  const value = String(formData.get(field) || "");
  return value ? new Date(value) : null;
}

function readExpiresAt(formData: FormData, startsAt: Date) {
  const durationMinutes = readOptionalInt(formData, "durationMinutes");
  if (durationMinutes && durationMinutes > 0) {
    return new Date(startsAt.getTime() + durationMinutes * 60_000);
  }
  return readDateTime(formData, "expiresAt") ?? new Date(startsAt.getTime() + 60 * 60_000);
}

function readOptionalInt(formData: FormData, field: string) {
  const value = String(formData.get(field) || "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : null;
}

function revalidateCouponPages() {
  revalidatePath("/admin/cupons");
  revalidatePath("/inscricao");
}

function redirectWithCouponMessage(type: "success" | "error", message: string): never {
  redirect(`/admin/cupons?${type}=${encodeURIComponent(message)}`);
}
