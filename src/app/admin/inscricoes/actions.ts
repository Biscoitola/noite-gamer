"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function cancelRegistrationAction(formData: FormData) {
  await requireAdmin();
  const registrationId = String(formData.get("registrationId") || "");
  if (!registrationId) {
    redirect("/admin/inscricoes?error=Inscricao invalida.");
  }

  await prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { items: { select: { id: true } } }
    });
    if (!registration) throw new Error("Inscricao nao encontrada.");

    const itemIds = registration.items.map((item) => item.id);
    await tx.checkIn.updateMany({
      where: { registrationItemId: { in: itemIds }, canceledAt: null },
      data: { canceledAt: new Date() }
    });
    await tx.tournamentEntry.deleteMany({
      where: { registrationItemId: { in: itemIds } }
    });
    await tx.registrationItem.updateMany({
      where: { registrationId },
      data: { status: "CANCELED" }
    });
    await tx.payment.updateMany({
      where: { registrationId, status: { in: ["PENDENTE", "EM_ANALISE"] } },
      data: { status: "CANCELADO" }
    });
    await tx.registration.update({
      where: { id: registrationId },
      data: { status: "CANCELADA", canceledAt: new Date() }
    });
  });

  revalidatePath("/admin/inscricoes");
  revalidatePath("/admin/check-in");
  revalidatePath("/admin/torneios");
  revalidatePath("/admin/relatorios/inscritos");
  revalidatePath("/torneios");
  redirect("/admin/inscricoes?success=Inscricao cancelada. Gere a chave novamente para atualizar os confrontos.");
}
