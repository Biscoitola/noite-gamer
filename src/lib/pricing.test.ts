import { describe, expect, it } from "vitest";
import { calculateRegistrationTotal, hasCapacity } from "./pricing";

describe("pricing", () => {
  it("calcula desconto por multiplas modalidades", () => {
    expect(calculateRegistrationTotal([{ gameId: "a", price: 30 }, { gameId: "b", price: 25 }]).total).toBe(50);
    expect(calculateRegistrationTotal([{ gameId: "a", price: 30 }, { gameId: "b", price: 25 }, { gameId: "c", price: 20 }]).total).toBe(65);
  });

  it("aplica cupom percentual", () => {
    expect(calculateRegistrationTotal([{ gameId: "a", price: 100 }], { code: "PROMO", type: "percent", value: 20, active: true }).total).toBe(80);
  });

  it("valida capacidade com reservas", () => {
    expect(hasCapacity(10, 8, 1, 1)).toBe(true);
    expect(hasCapacity(10, 8, 2, 1)).toBe(false);
  });
});
