import Link from "next/link";
import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";
import { ensureTournamentForGame } from "@/lib/tournaments/service";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const games = await prisma.game.findMany({
    where: {
      isActive: true,
      items: { some: { status: "CONFIRMED", registration: { status: "CONFIRMADA" } } }
    },
    include: {
      event: true,
      tournaments: { where: { public: true }, take: 1 },
      _count: { select: { items: { where: { status: "CONFIRMED", registration: { status: "CONFIRMADA" } } } } }
    },
    orderBy: { name: "asc" }
  }).catch(() => []);

  await Promise.all(games.filter((game) => game.tournaments.length === 0).map((game) => ensureTournamentForGame(game.id).catch(() => null)));

  const tournaments = await prisma.tournament.findMany({
    where: { public: true, game: { isActive: true, items: { some: { status: "CONFIRMED", registration: { status: "CONFIRMADA" } } } } },
    include: {
      game: {
        include: {
          _count: { select: { items: { where: { status: "CONFIRMED", registration: { status: "CONFIRMADA" } } } } }
        }
      }
    },
    orderBy: { game: { name: "asc" } }
  }).catch(() => []);
  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
        <h1 className="text-3xl font-black text-glow">Torneios</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          {tournaments.map((tournament) => (
          <Link className="group block cursor-pointer" key={tournament.id} href={`/torneios/${tournament.game.slug}`}>
            <Panel className="interactive-panel grid min-h-36 content-between gap-4">
              <h2 className="text-xl font-black text-[#FFD400]">{tournament.game.name}</h2>
              <p className="text-sm font-black uppercase text-[#B45CFF]">
                {tournament.game._count.items} confirmado{tournament.game._count.items === 1 ? "" : "s"} - {tournament.status}
              </p>
              <span className="inline-flex min-h-10 w-fit items-center border border-[#FFD400] px-3 text-xs font-black uppercase text-[#FFD400] transition group-hover:bg-[#FFD400] group-hover:text-black">
                Abrir chave
              </span>
            </Panel>
          </Link>
          ))}
          {tournaments.length === 0 ? <Panel><p>Nenhuma chave disponivel ainda. Assim que houver uma inscricao confirmada em um jogo, ela aparece aqui.</p></Panel> : null}
        </div>
      </Container>
    </>
  );
}
