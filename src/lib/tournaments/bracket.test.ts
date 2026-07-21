import { describe, expect, it } from "vitest";
import { generateSingleEliminationBracket, recordWinner } from "./bracket";

function entries(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: `p${index + 1}`, seed: index + 1, publicName: `Player ${index + 1}` }));
}

describe("single elimination bracket", () => {
  for (const count of [1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 17, 32, 33, 64]) {
    it(`gera chave valida para ${count} participantes`, () => {
      const bracket = generateSingleEliminationBracket(entries(count));
      expect(bracket.bracketSize).toBeGreaterThanOrEqual(count);
      expect((bracket.bracketSize & (bracket.bracketSize - 1)) === 0).toBe(true);
      expect(bracket.matches).toHaveLength(bracket.bracketSize - 1);
      expect(bracket.matches.every((match) => !(match.participant1EntryId === null && match.participant2EntryId === null && match.round === 1))).toBe(true);
    });
  }

  it("avanca vencedor automaticamente", () => {
    const bracket = generateSingleEliminationBracket(entries(4));
    recordWinner(bracket.matches, "r1m1", "p1");
    const next = bracket.matches.find((match) => match.id === "r2m1");
    expect(next?.participant1EntryId).toBe("p1");
  });

  it("avanca participante contra BYE", () => {
    const bracket = generateSingleEliminationBracket(entries(3));
    expect(bracket.matches.some((match) => match.status === "BYE")).toBe(true);
    const final = bracket.matches.find((match) => match.id === "r2m1");
    expect(Boolean(final?.participant1EntryId ?? final?.participant2EntryId)).toBe(true);
  });
});
