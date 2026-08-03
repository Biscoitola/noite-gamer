"use server";

import { prisma } from "@/lib/db";
import { normalizeWhatsapp } from "@/lib/security";

export type RegistrationLookupState = {
  error?: string;
  registrations?: Array<{
    protocol: string;
    raffleCode: string;
    status: string;
    totalAmount: string;
    couponCode?: string;
    couponDiscount: string;
    publicName: string;
    paymentStatus: string;
    games: Array<{ name: string; status: string; price: string }>;
  }>;
};

export async function lookupRegistration(_prevState: RegistrationLookupState, formData: FormData): Promise<RegistrationLookupState> {
  const whatsapp = normalizeWhatsapp(String(formData.get("whatsapp") ?? ""));

  if (whatsapp.length < 12) {
    return { error: "Informe o WhatsApp usado na inscricao." };
  }

  const registrations = await prisma.registration.findMany({
    where: { participant: { normalizedWhatsapp: whatsapp } },
    include: {
      participant: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      items: { include: { game: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  if (registrations.length === 0) {
    return { error: "Nao encontramos inscricoes com esse WhatsApp." };
  }

  return {
    registrations: registrations.map((registration) => ({
      protocol: registration.protocol,
      raffleCode: registration.raffleCode ?? registration.protocol,
      status: registration.status,
      totalAmount: Number(registration.totalAmount).toFixed(2),
      couponCode: registration.couponCode ?? undefined,
      couponDiscount: Number(registration.couponDiscount).toFixed(2),
      publicName: registration.participant.publicName,
      paymentStatus: registration.payments[0]?.status ?? "SEM_PAGAMENTO",
      games: registration.items.map((item) => ({
        name: item.game.name,
        status: item.status,
        price: Number(item.finalPrice).toFixed(2)
      }))
    }))
  };
}
