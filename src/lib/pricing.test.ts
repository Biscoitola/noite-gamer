import { describe, expect, it } from "vitest";
import { allocateItemPrices, calculateRegistrationTotal, hasCapacity } from "./pricing";

describe("pricing", () => {
  const games = [{ gameId: "rocket", price: 15 }, { gameId: "mk", price: 15 }];
  const combo = { comboEnabled: true, comboPrice: 24.9 };

  it("cobra 15 por um jogo e 24,90 por dois", () => {
    expect(calculateRegistrationTotal(games.slice(0, 1), undefined, combo).total).toBe(15);
    expect(calculateRegistrationTotal(games, undefined, combo)).toMatchObject({ subtotal: 30, multiGameDiscount: 5.1, total: 24.9 });
    expect(allocateItemPrices(games, 24.9).map((item) => item.finalPrice)).toEqual([12.45, 12.45]);
  });

  it("respeita combo desativado, valor personalizado e quantidade de jogos", () => {
    expect(calculateRegistrationTotal(games, undefined, { ...combo, comboEnabled: false }).total).toBe(30);
    expect(calculateRegistrationTotal(games, undefined, { ...combo, comboPrice: 20 }).total).toBe(20);
    expect(calculateRegistrationTotal([...games, { gameId: "third", price: 15 }], undefined, combo).total).toBe(45);
    expect(calculateRegistrationTotal([], undefined, combo).total).toBe(0);
    expect(calculateRegistrationTotal(games, undefined, { ...combo, comboPrice: 40 }).total).toBe(30);
  });

  it("aplica cupom depois do combo e distribui centavos sem perder valor", () => {
    const totals = calculateRegistrationTotal(games, { code: "PROMO", type: "PERCENT", value: 10, active: true }, combo);
    expect(totals).toMatchObject({ couponDiscount: 2.49, total: 22.41 });
    const allocated = allocateItemPrices(games, totals.total);
    expect(allocated.map((item) => item.finalPrice)).toEqual([11.21, 11.2]);
    expect(allocated.reduce((sum, item) => sum + Math.round(item.finalPrice * 100), 0)).toBe(2241);
    expect(calculateRegistrationTotal(games, { code: "FREE", type: "FIXED", value: 100, active: true }, combo).total).toBe(0);
  });
  it("calcula desconto por multiplas modalidades", () => {
    expect(calculateRegistrationTotal([{ gameId: "a", price: 30 }, { gameId: "b", price: 25 }]).total).toBe(50);
    expect(calculateRegistrationTotal([{ gameId: "a", price: 30 }, { gameId: "b", price: 25 }, { gameId: "c", price: 20 }]).total).toBe(65);
  });

  it("aplica cupom percentual", () => {
    expect(calculateRegistrationTotal([{ gameId: "a", price: 100 }], { code: "PROMO", type: "percent", value: 20, active: true }).total).toBe(80);
  });

  it("aplica cupom fixo sem deixar desconto maior que o subtotal", () => {
    const totals = calculateRegistrationTotal([{ gameId: "a", price: 30 }], { code: "FLASH", type: "FIXED", value: 50, active: true });
    expect(totals.couponDiscount).toBe(30);
    expect(totals.total).toBe(0);
  });

  it("valida capacidade com reservas", () => {
    expect(hasCapacity(10, 8, 1, 1)).toBe(true);
    expect(hasCapacity(10, 8, 2, 1)).toBe(false);
  });
});
