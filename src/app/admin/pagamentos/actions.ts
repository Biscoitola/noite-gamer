"use server";

import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/auth";
import { reconcilePdf } from "@/lib/payments/pdf-reconciliation";

export async function importPdfAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const file = formData.get("pdfFile");
  if (!(file instanceof File)) throw new Error("Arquivo PDF nao enviado.");
  const arrayBuffer = await file.arrayBuffer();
  const result = await reconcilePdf(Buffer.from(arrayBuffer));
  revalidatePath("/admin/pagamentos");
  revalidatePath("/admin/inscricoes");
  revalidatePath("/admin/check-in");
  return result;
}
