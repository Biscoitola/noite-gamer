import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { env } from "../env";
import { FakePaymentProvider } from "./fake";

describe("FakePaymentProvider", () => {
  it("cria cobranca Pix simulada", async () => {
    const provider = new FakePaymentProvider();
    const charge = await provider.createPixCharge({
      registrationId: "reg1",
      amount: 25,
      payerName: "Player",
      expiresAt: new Date(),
      idempotencyKey: "idem123456789"
    });
    expect(charge.qrCodeText).toContain("PIX-FAKE");
    expect(charge.status).toBe("PENDENTE");
  });

  it("valida webhook assinado", async () => {
    const provider = new FakePaymentProvider();
    const raw = JSON.stringify({ eventId: "evt1", externalPaymentId: "pay1", status: "PAGO" });
    const signature = crypto.createHmac("sha256", env.PAYMENT_WEBHOOK_SECRET).update(raw).digest("hex");
    const headers = new Headers({ "x-fake-signature": signature });
    expect(await provider.validateWebhook(headers, raw)).toBe(true);
  });
});
