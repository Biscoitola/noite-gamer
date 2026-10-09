export function isFifaAddon(game: { name: string; slug?: string }) {
  return game.slug === "fifa-26" || /^fifa\s*26$/i.test(game.name.trim());
}

export function isFifaBaseGame(game: { name: string; slug?: string }) {
  return game.slug === "mortal-kombat" || game.slug === "rocket-league" ||
    /^(mortal kombat(?:\s.*)?|rocket league)$/i.test(game.name.trim());
}
