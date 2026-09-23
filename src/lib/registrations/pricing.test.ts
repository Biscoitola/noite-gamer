import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRegistration } from "./service";

const mocks = vi.hoisted(() => ({
  event: vi.fn(), registration: vi.fn(), payment: vi.fn(), charge: vi.fn(), coupon: vi.fn()
}));

vi.mock("@/lib/db", () => {
  const tx = {
    registrationItem: { count: vi.fn().mockResolvedValue(0) },
    discountCoupon: { findFirst: mocks.coupon, updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    participant: { create: vi.fn().mockResolvedValue({ id: "participant", publicName: "Jogador" }) },
    registration: { create: mocks.registration },
    payment: { create: mocks.payment }
  };
  return { prisma: { event: { findFirst: mocks.event }, $transaction: (run: (client: typeof tx) => unknown) => run(tx) } };
});
vi.mock("@/lib/payments", () => ({ getPaymentProvider: () => ({ createPixCharge: mocks.charge }) }));

describe("valor cobrado na inscrição", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.event.mockResolvedValue({
      id: "edition", settings: { comboEnabled: true, comboPrice: 24.9 },
      games: ["rocket", "mk"].map((id) => ({ id, name: id, price: 15, capacity: 32, teamMode: "SOLO" }))
    });
    mocks.registration.mockResolvedValue({ id: "registration", protocol: "PROTOCOL" });
    mocks.charge.mockImplementation(async ({ amount }) => ({
      amount, provider: "fake", externalId: "payment", idempotencyKey: "key", status: "PENDENTE",
      qrCodeImage: "image", qrCodeText: "pix", expiresAt: new Date()
    }));
  });

  it.each([
    [["rocket"], 15],
    [["rocket", "mk"], 24.9]
  ] as const)("grava e cobra o total correto para %j", async (gameIds, amount) => {
    await createRegistration({ publicName: "Jogador", whatsapp: "54999999999", gameIds: [...gameIds], doubles: {}, consentTerms: true, consentPrivacy: true, consentImage: false });
    expect(mocks.charge).toHaveBeenCalledWith(expect.objectContaining({ amount }));
    expect(mocks.payment).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ amount }) }));
    const data = mocks.registration.mock.calls[0][0].data;
    expect(data.totalAmount).toBe(amount);
    expect(data.items.create.reduce((sum: number, item: { finalPrice: number }) => sum + Math.round(item.finalPrice * 100), 0)).toBe(Math.round(amount * 100));
  });

  it("cobra cupom sobre o combo e mantém o desconto nos itens", async () => {
    mocks.coupon.mockResolvedValue({ id: "coupon", code: "PROMO", type: "PERCENT", value: 10, isActive: true, startsAt: new Date(0), expiresAt: new Date("2099-01-01"), maxUses: null });
    await createRegistration({ publicName: "Jogador", whatsapp: "54999999999", gameIds: ["rocket", "mk"], doubles: {}, couponCode: "PROMO", consentTerms: true, consentPrivacy: true, consentImage: false });
    expect(mocks.charge).toHaveBeenCalledWith(expect.objectContaining({ amount: 22.41 }));
    const data = mocks.registration.mock.calls[0][0].data;
    expect(data.couponDiscount).toBe(2.49);
    expect(data.items.create.map((item: { finalPrice: number }) => item.finalPrice)).toEqual([11.21, 11.2]);
  });
});
