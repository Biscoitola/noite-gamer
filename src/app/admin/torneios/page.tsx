import { Container, Panel } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateTournamentAction, winnerAction } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage({ searchParams }: { searchParams: Promise<{ torneio?: string }> }) {
  await requireAdmin();
  const { torneio } = await searchParams;
  const games = await prisma.game.findMany({ where: { isActive: true } });
  const tournaments = await prisma.tournament.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      game: true,
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
      <Panel>
        <form action={generateTournamentAction} className="flex flex-wrap gap-3">
          <select name="gameId" className="min-h-12 border border-[#FFD400]/35 bg-black px-3">
            {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
          </select>
          <label className="flex items-center gap-2"><input name="onlyCheckedIn" type="checkbox" /> Somente check-in</label>
          <button className="min-h-12 bg-[#FFD400] px-4 font-black text-black">Gerar chave</button>
        </form>
      </Panel>

      <Panel className="grid gap-3">
        <h2 className="text-xl font-black text-[#FFD400]">Escolha a chave para editar</h2>
        <div className="flex flex-wrap gap-2">
          {tournaments.map((tournament) => (
            <Link
              className={`border px-4 py-3 text-sm font-black uppercase transition ${
                selectedTournament?.id === tournament.id
                  ? "border-[#FFD400] bg-[#FFD400] text-black"
                  : "border-[#B45CFF]/50 text-[#F5F5F5] hover:border-[#FFD400] hover:text-[#FFD400]"
              }`}
              href={`/admin/torneios?torneio=${tournament.id}`}
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
            <h2 className="text-xl font-black text-[#FFD400]">{selectedTournament.game.name} - {selectedTournament.status}</h2>
            <Link className="border border-[#B45CFF] px-3 py-2 text-sm font-black uppercase text-[#B45CFF] hover:border-[#FFD400] hover:text-[#FFD400]" href={`/torneios/${selectedTournament.game.slug}`}>
              Ver chave publica
            </Link>
          </div>
          {selectedTournament.rounds.map((round) => (
            <div key={round.id}>
              <h3 className="mb-2 font-bold text-[#B45CFF]">{round.name}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {round.matches.map((match) => (
                  <article key={match.id} className="grid gap-3 border border-[#FFD400]/25 bg-black/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <strong>Partida {match.position}</strong>
                      <span className="text-xs font-black uppercase text-[#A3A3A3]">{match.status}</span>
                    </div>
                    {match.winner ? (
                      <p className="border border-[#FFD400]/40 bg-[#FFD400]/10 p-2 text-sm font-black text-[#FFD400]">
                        Vencedor: {match.winner.participant.publicName}
                      </p>
                    ) : null}
                    <WinnerButton
                      disabled={!match.participant1 || !match.participant2 || match.status === "FINISHED"}
                      entryId={match.participant1?.id}
                      matchId={match.id}
                      name={match.participant1?.participant.publicName ?? "A definir"}
                    />
                    <WinnerButton
                      disabled={!match.participant1 || !match.participant2 || match.status === "FINISHED"}
                      entryId={match.participant2?.id}
                      matchId={match.id}
                      name={match.participant2?.participant.publicName ?? "A definir"}
                    />
                  </article>
                ))}
              </div>
            </div>
          ))}
        </Panel>
      ) : null}
    </Container>
  );
}

function WinnerButton({ disabled, entryId, matchId, name }: { disabled: boolean; entryId?: string; matchId: string; name: string }) {
  return (
    <form action={winnerAction}>
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="winnerEntryId" value={entryId ?? ""} />
      <button
        className="focus-ring grid min-h-12 w-full grid-cols-[1fr_auto] items-center gap-3 border border-[#B45CFF]/45 bg-[#111111] px-3 text-left font-black text-white transition hover:border-[#FFD400] hover:text-[#FFD400] disabled:cursor-not-allowed disabled:opacity-45"
        disabled={disabled || !entryId}
        type="submit"
      >
        <span>{name}</span>
        <span className="text-xs uppercase">Venceu</span>
      </button>
    </form>
  );
}
