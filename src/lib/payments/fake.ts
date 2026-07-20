import crypto from "node:crypto";
import QRCode from "qrcode";
import { env } from "../env";
import type { PaymentProvider, PaymentWebhookEvent, PixCharge, PixChargeInput } from "./provider";

const memoryStatus = new Map<string, PixCharge["status"]>();

export class FakePaymentProvider implements PaymentProvider {
  async createPixCharge(input: PixChargeInput): Promise<PixCharge> {
    const externalId = `fake_${input.registrationId}_${input.idempotencyKey.slice(0, 8)}`;
    const qrCodeText = `PIX-FAKE|NOITE-GAMER|${externalId}|${input.amount.toFixed(2)}`;
    memoryStatus.set(externalId, "PENDENTE");
    return {
      provider: "fake",
      externalId,
      idempotencyKey: input.idempotencyKey,
      status: "PENDENTE",
      amount: input.amount,
      qrCodeText,
      qrCodeImage: await QRCode.toDataURL(qrCodeText, { margin: 1, width: 320 }),
      expiresAt: input.expiresAt
    };
  }

  async getPaymentStatus(externalId: string) {
    return memoryStatus.get(externalId) ?? "PENDENTE";
  }

  async cancelCharge(externalId: string) {
    memoryStatus.set(externalId, "CANCELADO");
  }

  async refundCharge(externalId: string) {
    memoryStatus.set(externalId, "CANCELADO");
  }

  async validateWebhook(headers: Headers, rawBody: string) {
    const signature = headers.get("x-fake-signature");
    if (!signature) return false;
    const expected = crypto.createHmac("sha256", env.PAYMENT_WEBHOOK_SECRET).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  async parseWebhookEvent(rawBody: string): Promise<PaymentWebhookEvent> {
    const payload = JSON.parse(rawBody) as {
      eventId: string;
      externalPaymentId: string;
      status: PixCharge["status"];
    };
    memoryStatus.set(payload.externalPaymentId, payload.status);
    return {
      externalEventId: payload.eventId,
      externalPaymentId: payload.externalPaymentId,
      type: payload.status === "PAGO" ? "payment.paid" : payload.status === "EXPIRADO" ? "payment.expired" : "payment.failed",
      status: payload.status,
      payload
    };
  }
}
