"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function checkInAction(formData: FormData) {
  const admin = await requireAdmin();
  const registrationItemId = String(formData.get("registrationItemId") || "");
  const protocol = String(formData.get("protocol") || "");
  const item = await prisma.registrationItem.findFirst({
    where: registrationItemId
      ? { id: registrationItemId, registration: { status: "CONFIRMADA" } }
      : { registration: { protocol, status: "CONFIRMADA" } },
    include: { registration: true }
  });
  if (!item) return;
  const existing = await prisma.checkIn.findFirst({ where: { registrationItemId: item.id, canceledAt: null } });
  if (existing) return;
  await prisma.checkIn.create({
    data: { participantId: item.registration.participantId, registrationItemId: item.id, checkedInBy: admin.id }
  });
  revalidatePath("/admin/check-in");
}

export async function undoCheckInAction(formData: FormData) {
  await requireAdmin();
  const registrationItemId = String(formData.get("registrationItemId") || "");
  if (!registrationItemId) return;
  await prisma.checkIn.updateMany({
    where: { registrationItemId, canceledAt: null },
    data: { canceledAt: new Date() }
  });
  revalidatePath("/admin/check-in");
}
