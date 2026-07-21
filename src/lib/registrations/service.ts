import { addMinutes } from "date-fns";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { calculateRegistrationTotal } from "@/lib/pricing";
import { createProtocol, createPublicToken, hashToken, normalizeWhatsapp } from "@/lib/security";
import type { RegistrationInput } from "./schema";

export async function listActiveGames() {
  const event = await prisma.event.findFirst({
    where: { status: "ACTIVE" },
    include: { games: { where: { isActive: true }, orderBy: { name: "asc" } } }
  });
  return event;
}

export async function createRegistration(input: RegistrationInput) {
  const event = await listActiveGames();
  if (!event) throw new Error("Evento ativo nao encontrado.");
  const games = event.games.filter((game) => input.gameIds.includes(game.id));
  if (games.length !== input.gameIds.length) throw new Error("Modalidade invalida.");

  const totals = calculateRegistrationTotal(games.map((game) => ({ gameId: game.id, price: Number(game.price) })));
  const token = createPublicToken();
  const participantToken = createPublicToken();
  const protocol = createProtocol();
  const expiresAt = addMinutes(new Date(), Number((event.settings as { paymentExpiresInMinutes?: number }).paymentExpiresInMinutes ?? 30));
  const normalizedWhatsapp = normalizeWhatsapp(input.whatsapp);

  return prisma.$transaction(async (tx) => {
    for (const game of games) {
      const confirmed = await tx.registrationItem.count({
        where: { gameId: game.id, status: { in: ["CONFIRMED", "RESERVED"] } }
      });
      if (confirmed >= game.capacity) throw new Error(`Nao ha vagas disponiveis para ${game.name}.`);
    }

    const participant = await tx.participant.create({
      data: {
        fullName: input.fullName,
        publicName: input.publicName,
        whatsapp: input.whatsapp,
        normalizedWhatsapp,
        email: input.email || null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        city: input.city,
        publicId: nanoid(16),
        accessTokenHash: hashToken(participantToken),
        consentTermsAt: new Date(),
        consentPrivacyAt: new Date(),
        consentImageAt: input.consentImage ? new Date() : null
      }
    });

    const registration = await tx.registration.create({
      data: {
        eventId: event.id,
        participantId: participant.id,
        status: "AGUARDANDO_PAGAMENTO",
        totalAmount: totals.total,
        protocol,
        publicTokenHash: hashToken(token),
        expiresAt,
        items: {
          create: games.map((game) => ({
            gameId: game.id,
            unitPrice: game.price,
            finalPrice: Number(game.price),
            discount: 0,
            status: "RESERVED"
          }))
        }
      },
      include: { participant: true }
    });

    const provider = getPaymentProvider();
    const charge = await provider.createPixCharge({
      registrationId: registration.id,
      amount: totals.total,
      payerName: participant.fullName,
      payerEmail: participant.email,
      referenceCode: registration.protocol,
      expiresAt,
      idempotencyKey: nanoid(32)
    });

    await tx.payment.create({
      data: {
        registrationId: registration.id,
        provider: charge.provider,
        externalId: charge.externalId,
        idempotencyKey: charge.idempotencyKey,
        status: charge.status,
        amount: charge.amount,
        qrCodeImage: charge.qrCodeImage,
        qrCodeText: charge.qrCodeText,
        expiresAt: charge.expiresAt
      }
    });

    return { token, protocol: registration.protocol };
  });
}

export async function getRegistrationByToken(token: string) {
  return prisma.registration.findFirst({
    where: { publicTokenHash: hashToken(token) },
    include: {
      participant: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      items: { include: { game: true } }
    }
  });
}

export async function confirmPayment(externalPaymentId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { externalId: externalPaymentId },
      include: { registration: { include: { items: true } } }
    });
    if (!payment) throw new Error("Pagamento nao encontrado.");
    if (payment.status === "PAGO") return payment;

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAGO", paidAt: new Date() }
    });
    await tx.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CONFIRMADA", confirmedAt: new Date() }
    });
    await tx.registrationItem.updateMany({
      where: { registrationId: payment.registrationId },
      data: { status: "CONFIRMED" }
    });
    return payment;
  });
}
