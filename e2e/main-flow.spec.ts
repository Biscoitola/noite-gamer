import { test, expect } from "@playwright/test";

test("abre paginas principais", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NOITE GAMER" })).toBeVisible();
  await page.goto("/torneios");
  await expect(page.getByRole("heading", { name: "Torneios" })).toBeVisible();
  await page.goto("/ao-vivo");
  await expect(page.getByRole("heading", { name: /Aguardando partida|Final|Semifinal|Quartas|Oitavas/ })).toBeVisible();
});
