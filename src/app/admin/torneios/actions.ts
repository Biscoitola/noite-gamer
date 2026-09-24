"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ensureTournamentForGame, registerMatchWinner, resetSingleTournamentState, resetTournamentState, undoMatchWinner, updateMatchParticipants } from "@/lib/tournaments/service";

export async function generateTournamentAction(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") || "");
  const returnPrefix = adminTournamentsPath(eventId);
  try {
    await ensureTournamentForGame(String(formData.get("gameId")), true);
    revalidatePath("/admin/torneios");
    revalidatePublicResults();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel gerar a chave.";
    redirect(withMessage(returnPrefix, "error", message));
  }
  redirect(withMessage(returnPrefix, "success", "Chave atualizada."));
}

export async function winnerAction(formData: FormData) {
  await requireAdmin();
  const tournamentId = String(formData.get("tournamentId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await registerMatchWinner(String(formData.get("matchId")), String(formData.get("winnerEntryId")), { simple: true });
    revalidatePath("/admin/torneios");
    revalidatePublicResults();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel registrar o vencedor.";
    redirect(withMessage(adminTournamentsPath(eventId, tournamentId), "error", message));
  }
  redirect(withMessage(adminTournamentsPath(eventId, tournamentId), "success", "Vencedor registrado."));
}

export async function undoWinnerAction(formData: FormData) {
  await requireAdmin();
  const tournamentId = String(formData.get("tournamentId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  try {
    const result = await undoMatchWinner(String(formData.get("matchId")));
    revalidatePath("/admin/torneios");
    revalidatePublicResults();
    revalidatePath(`/torneios/${result.gameSlug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel desfazer o vencedor.";
    redirect(withMessage(adminTournamentsPath(eventId, tournamentId), "error", message));
  }
  redirect(withMessage(adminTournamentsPath(eventId, tournamentId), "success", "Vencedor desfeito."));
}

export async function updateMatchParticipantsAction(formData: FormData) {
  await requireAdmin();
  const matchId = String(formData.get("matchId"));
  const tournamentId = String(formData.get("tournamentId"));
  const eventId = String(formData.get("eventId") ?? "");
  const participant1EntryId = normalizeEntryId(formData.get("participant1EntryId"));
  const participant2EntryId = normalizeEntryId(formData.get("participant2EntryId"));
  try {
    const result = await updateMatchParticipants(matchId, participant1EntryId, participant2EntryId);
    revalidatePath("/admin/torneios");
    revalidatePublicResults();
    revalidatePath(`/torneios/${result.gameSlug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar a partida.";
    redirect(withMessage(adminTournamentsPath(eventId, tournamentId), "error", message));
  }
  redirect(withMessage(adminTournamentsPath(eventId, tournamentId), "success", "Partida atualizada."));
}

function normalizeEntryId(value: FormDataEntryValue | null) {
  const entryId = String(value ?? "");
  return entryId.length > 0 ? entryId : null;
}

export async function resetTournamentsAction(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") || "");
  try {
    const result = await resetTournamentState(eventId || undefined);
    revalidatePath("/admin/torneios");
    revalidatePublicResults();
    result.gameSlugs.forEach((slug) => revalidatePath(`/torneios/${slug}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel zerar os torneios.";
    redirect(withMessage(adminTournamentsPath(eventId), "error", message));
  }
  redirect(withMessage(adminTournamentsPath(eventId), "success", "Torneios, chaves e sorteios da edicao zerados."));
}

export async function resetSingleTournamentAction(formData: FormData) {
  await requireAdmin();
  const tournamentId = String(formData.get("tournamentId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  try {
    const result = await resetSingleTournamentState(tournamentId);
    revalidatePath("/admin/torneios");
    revalidatePublicResults();
    revalidatePath(`/torneios/${result.gameSlug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel zerar esta chave.";
    redirect(withMessage(adminTournamentsPath(eventId, tournamentId), "error", message));
  }
  redirect(withMessage(adminTournamentsPath(eventId), "success", "Chave zerada."));
}

function adminTournamentsPath(eventId?: string, tournamentId?: string) {
  const params = new URLSearchParams();
  if (eventId) params.set("eventId", eventId);
  if (tournamentId) params.set("torneio", tournamentId);
  const query = params.toString();
  return query ? `/admin/torneios?${query}` : "/admin/torneios";
}

function withMessage(path: string, key: "success" | "error", message: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(message)}`;
}

function revalidatePublicResults() {
  revalidatePath("/torneios");
  revalidatePath("/torneios/[slug]", "page");
  revalidatePath("/ao-vivo");
  revalidatePath("/sorteios");
  revalidatePath("/admin/sorteios");
}
