import { Container, Panel } from "@/components/ui";
import { AdminEventSelector, type AdminSearchParams, getAdminEventFilter, readSearchParam } from "@/lib/admin-event-filter";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateTournamentAction, resetSingleTournamentAction, resetTournamentsAction, undoWinnerAction, updateMatchParticipantsAction, winnerAction } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { events, selectedEventId } = await getAdminEventFilter(params);
  const torneio = readSearchParam(params.torneio);
  const success = readSearchParam(params.success);
  const error = readSearchParam(params.error);
  const games = await prisma.game.findMany({ where: { isActive: true, ...(selectedEventId ? { eventId: selectedEventId } : {}) } });
  const tournaments = await prisma.tournament.findMany({
    where: selectedEventId ? { eventId: selectedEventId } : {},
    orderBy: { updatedAt: "desc" },
    include: {
      game: true,
      entries: {
        orderBy: { seed: "asc" },
        include: { participant: true }
      },
      rounds: {
        orderBy: { order: "asc" },
        include: {
          matches: {
            orderBy: { position: "asc" },
            include: {
              participant1: { include: { participant: true } },
              participant2: { include: { participant: true } },
              winner: { include: { participant: true } }
            }
          }
        }
      }
    }
  });
  const selectedTournament = tournaments.find((item) => item.id === torneio) ?? tournaments[0] ?? null;
  return (
    <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Torneios</h1>
      <AdminEventSelector events={events} selectedEventId={selectedEventId} params={params} />
      {success ? (
        <div className="border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="border border-red-400/45 bg-red-500/10 p-3 text-sm font-black text-red-100">
          {error}
        </div>
      ) : null}
      <Panel className="grid gap-4">
        <div>
          <h2 className="text-xl font-black text-[#A855F7]">Gerar chave por presenca</h2>
          <p className="mt-2 text-sm leading-6 text-[#A3A3A3]">
            A chave usa somente jogadores com check-in confirmado no jogo selecionado.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <form action={generateTournamentAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="eventId" value={selectedEventId} />
            <select name="gameId" className="min-h-12 border border-[#A855F7]/35 bg-black px-3">
              {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
            </select>
            <button className="neon-action min-h-12 px-4 font-black">Gerar chave com presentes</button>
          </form>
          <form action={resetTournamentsAction}>
            <input type="hidden" name="eventId" value={selectedEventId} />
            <button className="min-h-12 border border-red-500/60 px-4 font-black uppercase text-red-200 hover:bg-red-500/10">
              Zerar chaves e ganhadores da edicao
            </button>
          </form>
        </div>
      </Panel>

      <Panel className="grid gap-3">
        <h2 className="text-xl font-black text-[#A855F7]">Escolha a chave para editar</h2>
        <div className="flex flex-wrap gap-2">
          {tournaments.map((tournament) => (
            <Link
              className={`border px-4 py-3 text-sm font-black uppercase transition ${
                selectedTournament?.id === tournament.id
                  ? "border-[#00FF88] bg-[#00FF88] text-[#020704]"
                  : "border-[#B45CFF]/50 text-[#F5F5F5] hover:border-[#A855F7] hover:text-[#A855F7]"
              }`}
              href={`/admin/torneios?eventId=${selectedEventId}&torneio=${tournament.id}`}
              key={tournament.id}
            >
              {tournament.game.name}
            </Link>
          ))}
          {tournaments.length === 0 ? <p className="text-[#A3A3A3]">Nenhuma chave gerada ainda.</p> : null}
        </div>
      </Panel>

      {selectedTournament ? (
        <Panel key={selectedTournament.id} className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[#A855F7]">{selectedTournament.game.name} - {selectedTournament.status}</h2>
            <div className="flex flex-wrap gap-2">
              <Link className="border border-[#B45CFF] px-3 py-2 text-sm font-black uppercase text-[#B45CFF] hover:border-[#A855F7] hover:text-[#A855F7]" href={`/torneios/${selectedTournament.game.slug}`}>
                Ver chave publica
              </Link>
              <form action={resetSingleTournamentAction}>
                <input type="hidden" name="tournamentId" value={selectedTournament.id} />
                <input type="hidden" name="eventId" value={selectedEventId} />
                <button className="min-h-10 border border-red-500/60 px-3 text-sm font-black uppercase text-red-200 hover:bg-red-500/10">
                  Zerar esta chave
                </button>
              </form>
            </div>
          </div>
          {selectedTournament.rounds.map((round) => {
            const assignedEntryIds = new Set(
              round.matches.flatMap((match) => [match.participant1EntryId, match.participant2EntryId]).filter(Boolean) as string[]
            );
            return (
            <div key={round.id}>
              <h3 className="mb-2 font-bold text-[#B45CFF]">{round.name}</h3>
              <p className="mb-3 text-sm text-[#A3A3A3]">
                Aloque manualmente cada jogador nesta fase. Quem ja estiver em outra partida da fase fica bloqueado para evitar duplicidade.
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {round.matches.map((match) => (
                  <article key={match.id} className="grid gap-3 border border-[#A855F7]/25 bg-black/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <strong>Partida {match.position}</strong>
                      <span className="text-xs font-black uppercase text-[#A3A3A3]">{match.status}</span>
                    </div>
                    {match.winner ? (
                      <p className="border border-[#A855F7]/40 bg-[#A855F7]/10 p-2 text-sm font-black text-[#A855F7]">
                        Vencedor: {entryName(match.winner)}
                      </p>
                    ) : null}
                    {match.winner ? <UndoWinnerButton eventId={selectedEventId} matchId={match.id} tournamentId={selectedTournament.id} /> : null}
                    <form action={updateMatchParticipantsAction} className="grid gap-2 border border-[#B45CFF]/20 bg-[#0B0712]/70 p-2">
                      <input type="hidden" name="matchId" value={match.id} />
                      <input type="hidden" name="tournamentId" value={selectedTournament.id} />
                      <input type="hidden" name="eventId" value={selectedEventId} />
                      <label className="grid gap-1 text-xs font-black uppercase text-[#A3A3A3]">
                        Jogador 1
                        <select
                          className="min-h-10 border border-[#B45CFF]/45 bg-black px-2 text-sm font-black text-white"
                          defaultValue={match.participant1EntryId ?? ""}
                          disabled={match.status === "FINISHED"}
                          name="participant1EntryId"
                        >
                          <option value="">A definir</option>
                          {selectedTournament.entries.map((entry) => (
                            <option
                              disabled={assignedEntryIds.has(entry.id) && entry.id !== match.participant1EntryId && entry.id !== match.participant2EntryId}
                              key={entry.id}
                              value={entry.id}
                            >
                              {entryName(entry)}
                              {assignedEntryIds.has(entry.id) && entry.id !== match.participant1EntryId && entry.id !== match.participant2EntryId ? " - ja alocado" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-xs font-black uppercase text-[#A3A3A3]">
                        Jogador 2
                        <select
                          className="min-h-10 border border-[#B45CFF]/45 bg-black px-2 text-sm font-black text-white"
                          defaultValue={match.participant2EntryId ?? ""}
                          disabled={match.status === "FINISHED"}
                          name="participant2EntryId"
                        >
                          <option value="">A definir</option>
                          {selectedTournament.entries.map((entry) => (
                            <option
                              disabled={assignedEntryIds.has(entry.id) && entry.id !== match.participant1EntryId && entry.id !== match.participant2EntryId}
                              key={entry.id}
                              value={entry.id}
                            >
                              {entryName(entry)}
                              {assignedEntryIds.has(entry.id) && entry.id !== match.participant1EntryId && entry.id !== match.participant2EntryId ? " - ja alocado" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="min-h-10 rounded-[8px] border border-[#00FF88]/60 px-3 text-sm font-black uppercase text-[#00FF88] transition hover:bg-[#00FF88] hover:text-[#020704] disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={match.status === "FINISHED"}
                        type="submit"
                      >
                        Salvar confronto
                      </button>
                    </form>
                    <WinnerButton
                      disabled={!match.participant1 || !match.participant2 || match.status === "FINISHED"}
                      entryId={match.participant1?.id}
                      matchId={match.id}
                      name={entryName(match.participant1)}
                      tournamentId={selectedTournament.id}
                      eventId={selectedEventId}
                    />
                    <WinnerButton
                      disabled={!match.participant1 || !match.participant2 || match.status === "FINISHED"}
                      entryId={match.participant2?.id}
                      matchId={match.id}
                      name={entryName(match.participant2)}
                      tournamentId={selectedTournament.id}
                      eventId={selectedEventId}
                    />
                  </article>
                ))}
              </div>
            </div>
          );
          })}
        </Panel>
      ) : null}
    </Container>
  );
}

function entryName(entry: { displayName: string | null; participant: { publicName: string } } | null | undefined) {
  return entry?.displayName ?? entry?.participant.publicName ?? "A definir";
}

function UndoWinnerButton({ eventId, matchId, tournamentId }: { eventId: string; matchId: string; tournamentId: string }) {
  return (
    <form action={undoWinnerAction}>
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="eventId" value={eventId} />
      <button
        className="min-h-10 w-full border border-red-500/60 px-3 text-sm font-black uppercase text-red-200 transition hover:bg-red-500/10"
        type="submit"
      >
        Desfazer vencedor
      </button>
    </form>
  );
}

function WinnerButton({ disabled, entryId, eventId, matchId, name, tournamentId }: { disabled: boolean; entryId?: string; eventId: string; matchId: string; name: string; tournamentId: string }) {
  return (
    <form action={winnerAction}>
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="winnerEntryId" value={entryId ?? ""} />
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="eventId" value={eventId} />
      <button
        className="focus-ring grid min-h-12 w-full grid-cols-[1fr_auto] items-center gap-3 border border-[#B45CFF]/45 bg-[#0B0712] px-3 text-left font-black text-white transition hover:border-[#A855F7] hover:text-[#A855F7] disabled:cursor-not-allowed disabled:opacity-45"
        disabled={disabled || !entryId}
        type="submit"
      >
        <span>{name}</span>
        <span className="text-xs uppercase">Venceu</span>
      </button>
    </form>
  );
}
