export type PixChargeInput = {
  registrationId: string;
  amount: number;
  payerName: string;
  payerEmail?: string | null;
  referenceCode?: string;
  expiresAt: Date;
  idempotencyKey: string;
};

export type PixCharge = {
  provider: string;
  externalId: string;
  idempotencyKey: string;
  status: "PENDENTE" | "PAGO" | "EXPIRADO" | "CANCELADO" | "FALHOU";
  amount: number;
  qrCodeText: string;
  qrCodeImage: string;
  expiresAt: Date;
};

export type PaymentWebhookEvent = {
  externalEventId: string;
  externalPaymentId: string;
  type: "payment.paid" | "payment.expired" | "payment.canceled" | "payment.failed";
  status: PixCharge["status"];
  payload: unknown;
};

export interface PaymentProvider {
  createPixCharge(input: PixChargeInput): Promise<PixCharge>;
  getPaymentStatus(externalId: string): Promise<PixCharge["status"]>;
  cancelCharge(externalId: string): Promise<void>;
  refundCharge(externalId: string): Promise<void>;
  validateWebhook(headers: Headers, rawBody: string): Promise<boolean>;
  parseWebhookEvent(rawBody: string): Promise<PaymentWebhookEvent>;
}
