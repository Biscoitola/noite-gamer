"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ensureTournamentForGame, registerMatchWinner } from "@/lib/tournaments/service";

export async function generateTournamentAction(formData: FormData) {
  await requireAdmin();
  try {
    await ensureTournamentForGame(String(formData.get("gameId")), formData.get("onlyCheckedIn") === "on");
    revalidatePath("/admin/torneios");
    revalidatePath("/torneios");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel gerar a chave.";
    redirect(`/admin/torneios?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/torneios?success=Chave atualizada.");
}

export async function winnerAction(formData: FormData) {
  await requireAdmin();
  try {
    await registerMatchWinner(String(formData.get("matchId")), String(formData.get("winnerEntryId")), { simple: true });
    revalidatePath("/admin/torneios");
    revalidatePath("/torneios");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel registrar o vencedor.";
    redirect(`/admin/torneios?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/torneios?success=Vencedor registrado.");
}
