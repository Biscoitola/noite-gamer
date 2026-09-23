import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculatePrizePool, readEditionCommerceSettings } from "./edition-settings";
import { getEditionPrizePool } from "./prize-pool";

const { aggregate } = vi.hoisted(() => ({ aggregate: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { payment: { aggregate } } }));

describe("premiação acumulada", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reserva 10% para a organização e arredonda o prêmio em centavos", () => {
    expect(calculatePrizePool(100, 90)).toBe(90);
    expect(calculatePrizePool(24.9, 90)).toBe(22.41);
    expect(calculatePrizePool(39.9, 90)).toBe(35.91);
    expect(calculatePrizePool(15, 0)).toBe(0);
    expect(calculatePrizePool(15, 100)).toBe(15);
  });

  it("não publica prêmio sem a caixa marcada", async () => {
    expect(await getEditionPrizePool({ id: "event", settings: {} })).toBeNull();
    expect(aggregate).not.toHaveBeenCalled();
  });

  it("considera somente pagamentos confirmados, sem reembolso e da edição selecionada", async () => {
    aggregate.mockResolvedValue({ _sum: { amount: 39.9 } });
    expect(await getEditionPrizePool({ id: "edition-october", settings: { showPrizePool: true, prizePoolPercent: 90 } })).toEqual({ amount: 35.91, percent: 90 });
    expect(aggregate).toHaveBeenCalledWith({
      where: { status: "PAGO", refundedAt: null, registration: { eventId: "edition-october", status: "CONFIRMADA" } },
      _sum: { amount: true }
    });
  });

  it("mostra zero quando ainda não há pagamentos", async () => {
    aggregate.mockResolvedValue({ _sum: { amount: null } });
    expect(await getEditionPrizePool({ id: "event", settings: { showPrizePool: true } })).toEqual({ amount: 0, percent: 90 });
  });

  it("usa valores seguros para configurações antigas ou inválidas", () => {
    expect(readEditionCommerceSettings(null)).toEqual({ comboEnabled: false, comboPrice: 24.9, showPrizePool: false, prizePoolPercent: 90 });
    expect(readEditionCommerceSettings({ comboPrice: -1, prizePoolPercent: 101 }).prizePoolPercent).toBe(90);
    expect(readEditionCommerceSettings({ comboEnabled: true, comboPrice: 19.9, prizePoolPercent: 85 })).toMatchObject({ comboEnabled: true, comboPrice: 19.9, prizePoolPercent: 85 });
  });
});
