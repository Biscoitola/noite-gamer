"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ensureTournamentForGame, registerMatchWinner, resetTournamentState } from "@/lib/tournaments/service";

export async function generateTournamentAction(formData: FormData) {
  await requireAdmin();
  try {
    await ensureTournamentForGame(String(formData.get("gameId")), true);
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

export async function resetTournamentsAction() {
  await requireAdmin();
  try {
    await resetTournamentState();
    revalidatePath("/admin/torneios");
    revalidatePath("/torneios");
    revalidatePath("/admin/sorteios");
    revalidatePath("/sorteios");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel zerar os torneios.";
    redirect(`/admin/torneios?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/torneios?success=Torneios, chaves e sorteios zerados.");
}
