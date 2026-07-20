import QRCode from "qrcode";
import { env } from "../env";
import type { PaymentProvider, PaymentWebhookEvent, PixCharge, PixChargeInput } from "./provider";

export class ManualPixProvider implements PaymentProvider {
  async createPixCharge(input: PixChargeInput): Promise<PixCharge> {
    if (!env.PIX_KEY) throw new Error("PIX_KEY nao configurada.");
    const txid = sanitizeTxid(input.registrationId).slice(0, 25);
    const qrCodeText = buildPixPayload({
      pixKey: env.PIX_KEY,
      receiverName: env.PIX_RECEIVER_NAME,
      receiverCity: env.PIX_RECEIVER_CITY,
      amount: input.amount,
      txid
    });
    return {
      provider: "manualpix",
      externalId: `manualpix_${txid}`,
      idempotencyKey: input.idempotencyKey,
      status: "PENDENTE",
      amount: input.amount,
      qrCodeText,
      qrCodeImage: await QRCode.toDataURL(qrCodeText, { margin: 1, width: 320 }),
      expiresAt: input.expiresAt
    };
  }

  async getPaymentStatus() {
    return "PENDENTE" as const;
  }

  async cancelCharge() {}

  async refundCharge() {}

  async validateWebhook() {
    return false;
  }

  async parseWebhookEvent(): Promise<PaymentWebhookEvent> {
    throw new Error("Pix manual nao usa webhook; use conciliacao OFX.");
  }
}

function buildPixPayload(input: { pixKey: string; receiverName: string; receiverCity: string; amount: number; txid: string }) {
  const merchantAccount = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", input.pixKey);
  const additionalData = tlv("05", input.txid);
  const payloadWithoutCrc =
    tlv("00", "01") +
    tlv("26", merchantAccount) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", input.amount.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", normalizePixText(input.receiverName, 25)) +
    tlv("60", normalizePixText(input.receiverCity, 15)) +
    tlv("62", additionalData) +
    "6304";
  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

function tlv(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function normalizePixText(value: string, max: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);
}

function sanitizeTxid(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "NOITEGAMER";
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
