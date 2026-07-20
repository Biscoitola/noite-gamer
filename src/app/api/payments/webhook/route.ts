import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments";
import { confirmPayment } from "@/lib/registrations/service";
import { sanitizePayload } from "@/lib/security";

export async function POST(request: Request) {
  const raw = await request.text();
  const provider = getPaymentProvider();
  const valid = await provider.validateWebhook(request.headers, raw);
  if (!valid) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  const event = await provider.parseWebhookEvent(raw);
  const providerName = env.PAYMENT_PROVIDER;
  const existing = await prisma.paymentWebhook.findUnique({
    where: { provider_externalEventId: { provider: providerName, externalEventId: event.externalEventId } }
  });
  if (existing?.processed) return NextResponse.json({ ok: true, duplicate: true });

  const payment = await prisma.payment.findUnique({ where: { externalId: event.externalPaymentId } });
  const webhook = await prisma.paymentWebhook.upsert({
    where: { provider_externalEventId: { provider: providerName, externalEventId: event.externalEventId } },
    update: {},
    create: {
      provider: providerName,
      externalEventId: event.externalEventId,
      paymentId: payment?.id,
      type: event.type,
      payloadSanitized: sanitizePayload(event.payload) as object
    }
  });

  try {
    if (event.status === "PAGO") await confirmPayment(event.externalPaymentId);
    await prisma.paymentWebhook.update({
      where: { id: webhook.id },
      data: { processed: true, processedAt: new Date() }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await prisma.paymentWebhook.update({
      where: { id: webhook.id },
      data: { error: error instanceof Error ? error.message : "unknown error" }
    });
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
