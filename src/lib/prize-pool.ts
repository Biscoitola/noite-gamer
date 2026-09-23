import { prisma } from "@/lib/db";
import { calculatePrizePool, readEditionCommerceSettings } from "@/lib/edition-settings";

export async function getEditionPrizePool(event: { id: string; settings: unknown }) {
  const config = readEditionCommerceSettings(event.settings);
  if (!config.showPrizePool) return null;
  const paid = await prisma.payment.aggregate({
    where: {
      status: "PAGO",
      refundedAt: null,
      registration: { eventId: event.id, status: "CONFIRMADA" }
    },
    _sum: { amount: true }
  });
  return { amount: calculatePrizePool(Number(paid._sum.amount ?? 0), config.prizePoolPercent), percent: config.prizePoolPercent };
}
