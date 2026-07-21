"use server";

import { prisma } from "@/lib/db";
import { normalizeWhatsapp } from "@/lib/security";

export type RegistrationLookupState = {
  error?: string;
  registration?: {
    protocol: string;
    status: string;
    totalAmount: string;
    publicName: string;
    fullName: string;
    city: string;
    paymentStatus: string;
    games: Array<{ name: string; status: string; price: string }>;
  };
};

export async function lookupRegistration(_prevState: RegistrationLookupState, formData: FormData): Promise<RegistrationLookupState> {
  const protocol = String(formData.get("protocol") ?? "").trim().toUpperCase();
  const whatsapp = normalizeWhatsapp(String(formData.get("whatsapp") ?? ""));

  if (!protocol || whatsapp.length < 12) {
    return { error: "Informe o protocolo e o WhatsApp usado na inscricao." };
  }

  const registration = await prisma.registration.findFirst({
    where: {
      protocol,
      participant: { normalizedWhatsapp: whatsapp }
    },
    include: {
      participant: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      items: { include: { game: true }, orderBy: { createdAt: "asc" } }
    }
  });

  if (!registration) {
    return { error: "Nao encontramos uma inscricao com esse protocolo e WhatsApp." };
  }

  return {
    registration: {
      protocol: registration.protocol,
      status: registration.status,
      totalAmount: Number(registration.totalAmount).toFixed(2),
      publicName: registration.participant.publicName,
      fullName: registration.participant.fullName,
      city: registration.participant.city,
      paymentStatus: registration.payments[0]?.status ?? "SEM_PAGAMENTO",
      games: registration.items.map((item) => ({
        name: item.game.name,
        status: item.status,
        price: Number(item.finalPrice).toFixed(2)
      }))
    }
  };
}
