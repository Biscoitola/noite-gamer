export function isFifaAddon(game: { name: string; slug?: string }) {
  return game.slug === "fifa-26" || /^fifa\s*26$/i.test(game.name.trim());
}

export function isFifaBaseGame(game: { name: string; slug?: string }) {
  return game.slug === "mortal-kombat" || game.slug === "rocket-league" ||
    /^(mortal kombat(?:\s.*)?|rocket league)$/i.test(game.name.trim());
}
export function usesLegacyFifaAddon(startsAt: Date | string | null | undefined) {
  if (!startsAt) return false;
  const date = new Date(startsAt);
  return Number.isFinite(date.getTime()) && date.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }) === "2026-10-17";
}

