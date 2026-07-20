import { env } from "../env";
import { FakePaymentProvider } from "./fake";
import { ManualPixProvider } from "./manual-pix";
import { MercadoPagoProvider } from "./mercadopago";
import type { PaymentProvider } from "./provider";

export function getPaymentProvider(): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "fake") return new FakePaymentProvider();
  if (env.PAYMENT_PROVIDER === "manualpix") return new ManualPixProvider();
  if (env.PAYMENT_PROVIDER === "mercadopago") return new MercadoPagoProvider();
  return new FakePaymentProvider();
}
