import { describe, expect, it } from "vitest";
import { createProtocol, normalizeWhatsapp } from "./security";

describe("security helpers", () => {
  it("normaliza whatsapp brasileiro", () => {
    expect(normalizeWhatsapp("(54) 99999-9999")).toBe("5554999999999");
    expect(normalizeWhatsapp("+55 54 99999-9999")).toBe("5554999999999");
  });

  it("gera protocolo amigavel", () => {
    expect(createProtocol()).toMatch(/^NG-\d{8}-[A-Z0-9_-]{8}$/);
  });
});
