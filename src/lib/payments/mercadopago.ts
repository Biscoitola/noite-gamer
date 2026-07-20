import crypto from "node:crypto";
import { env } from "../env";
import type { PaymentProvider, PaymentWebhookEvent, PixCharge, PixChargeInput } from "./provider";

type MercadoPagoPayment = {
  id: number | string;
  status: string;
  status_detail?: string;
  transaction_amount?: number;
  date_of_expiration?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
};

type MercadoPagoWebhookPayload = {
  id?: number | string;
  action?: string;
  type?: string;
  data?: {
    id?: number | string;
  };
};

const baseUrl = "https://api.mercadopago.com";

export class MercadoPagoProvider implements PaymentProvider {
  async createPixCharge(input: PixChargeInput): Promise<PixCharge> {
    assertConfigured();
    const response = await fetch(`${baseUrl}/v1/payments`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${env.PAYMENT_ACCESS_TOKEN}`,
        "X-Idempotency-Key": input.idempotencyKey
      },
      body: JSON.stringify({
        transaction_amount: input.amount,
        description: `Noite Gamer - inscricao ${input.registrationId}`,
        payment_method_id: "pix",
        date_of_expiration: input.expiresAt.toISOString(),
        external_reference: input.registrationId,
        payer: {
          email: input.payerEmail || "participante@noitegamer.local",
          first_name: input.payerName.split(" ")[0] || input.payerName
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mercado Pago recusou a criacao do Pix: ${response.status} ${errorText}`);
    }

    const payment = (await response.json()) as MercadoPagoPayment;
    const transactionData = payment.point_of_interaction?.transaction_data;
    const qrCodeText = transactionData?.qr_code;
    const qrCodeBase64 = transactionData?.qr_code_base64;
    if (!payment.id || !qrCodeText || !qrCodeBase64) {
      throw new Error("Mercado Pago nao retornou QR Code Pix completo.");
    }

    return {
      provider: "mercadopago",
      externalId: String(payment.id),
      idempotencyKey: input.idempotencyKey,
      status: mapMercadoPagoStatus(payment.status),
      amount: Number(payment.transaction_amount ?? input.amount),
      qrCodeText,
      qrCodeImage: `data:image/jpeg;base64,${qrCodeBase64}`,
      expiresAt: payment.date_of_expiration ? new Date(payment.date_of_expiration) : input.expiresAt
    };
  }

  async getPaymentStatus(externalId: string) {
    const payment = await this.fetchPayment(externalId);
    return mapMercadoPagoStatus(payment.status);
  }

  async cancelCharge() {
    throw new Error("Cancelamento automatico de Pix Mercado Pago nao implementado; use expiracao/reconciliacao.");
  }

  async refundCharge() {
    throw new Error("Reembolso Mercado Pago deve ser executado com fluxo administrativo dedicado.");
  }

  async validateWebhook(headers: Headers, rawBody: string) {
    if (!env.PAYMENT_WEBHOOK_SECRET) return false;
    const xSignature = headers.get("x-signature");
    const xRequestId = headers.get("x-request-id");
    if (!xSignature || !xRequestId) return false;

    const parts = Object.fromEntries(
      xSignature.split(",").map((part) => {
        const [key, value] = part.split("=");
        return [key?.trim(), value?.trim()];
      })
    );
    const ts = parts.ts;
    const received = parts.v1;
    if (!ts || !received) return false;

    const payload = safeJson(rawBody);
    const dataId = String(payload?.data?.id ?? payload?.id ?? "");
    if (!dataId) return false;

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expected = crypto.createHmac("sha256", env.PAYMENT_WEBHOOK_SECRET).update(manifest).digest("hex");
    return safeEqual(received, expected);
  }

  async parseWebhookEvent(rawBody: string): Promise<PaymentWebhookEvent> {
    const payload = JSON.parse(rawBody) as MercadoPagoWebhookPayload;
    const externalPaymentId = String(payload.data?.id ?? payload.id ?? "");
    if (!externalPaymentId) throw new Error("Webhook Mercado Pago sem data.id.");

    const payment = await this.fetchPayment(externalPaymentId);
    const status = mapMercadoPagoStatus(payment.status);
    return {
      externalEventId: String(payload.id ?? `${externalPaymentId}-${payload.action ?? payment.status}`),
      externalPaymentId,
      type: status === "PAGO" ? "payment.paid" : status === "EXPIRADO" ? "payment.expired" : status === "CANCELADO" ? "payment.canceled" : "payment.failed",
      status,
      payload: {
        webhook: payload,
        payment: sanitizeMercadoPagoPayment(payment)
      }
    };
  }

  private async fetchPayment(externalId: string) {
    assertConfigured();
    const response = await fetch(`${baseUrl}/v1/payments/${externalId}`, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${env.PAYMENT_ACCESS_TOKEN}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao consultar pagamento Mercado Pago: ${response.status} ${errorText}`);
    }
    return (await response.json()) as MercadoPagoPayment;
  }
}

function mapMercadoPagoStatus(status: string): PixCharge["status"] {
  if (status === "approved") return "PAGO";
  if (status === "cancelled" || status === "canceled") return "CANCELADO";
  if (status === "rejected") return "FALHOU";
  if (status === "expired") return "EXPIRADO";
  return "PENDENTE";
}

function assertConfigured() {
  if (!env.PAYMENT_ACCESS_TOKEN) {
    throw new Error("PAYMENT_ACCESS_TOKEN nao configurado para Mercado Pago.");
  }
}

function safeJson(rawBody: string): MercadoPagoWebhookPayload | null {
  try {
    return JSON.parse(rawBody) as MercadoPagoWebhookPayload;
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function sanitizeMercadoPagoPayment(payment: MercadoPagoPayment) {
  return {
    id: payment.id,
    status: payment.status,
    status_detail: payment.status_detail,
    transaction_amount: payment.transaction_amount,
    date_of_expiration: payment.date_of_expiration
  };
}
