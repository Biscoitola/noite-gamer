"use server";

import { revalidatePath } from "next/cache";
import { ensureTournamentForGame, registerMatchWinner } from "@/lib/tournaments/service";

export async function generateTournamentAction(formData: FormData) {
  await ensureTournamentForGame(String(formData.get("gameId")), formData.get("onlyCheckedIn") === "on");
  revalidatePath("/admin/torneios");
  revalidatePath("/torneios");
}

export async function winnerAction(formData: FormData) {
  await registerMatchWinner(String(formData.get("matchId")), String(formData.get("winnerEntryId")), { simple: true });
  revalidatePath("/admin/torneios");
  revalidatePath("/torneios");
}
