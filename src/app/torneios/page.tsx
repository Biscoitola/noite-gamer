import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    where: {
      public: true,
      status: { not: "DRAFT" },
      matches: { some: {} },
      game: {
        isActive: true,
        event: { status: "ACTIVE" },
        items: { some: { status: { in: ["CONFIRMED", "RESERVED"] }, registration: { status: "CONFIRMADA" } } }
      }
    },
    include: {
      game: {
        include: {
          _count: { select: { items: { where: { status: { in: ["CONFIRMED", "RESERVED"] }, registration: { status: "CONFIRMADA" } } } } }
        }
      }
    },
    orderBy: { game: { name: "asc" } }
  }).catch(() => []);
  return (
    <div className="page-shell min-h-screen">
      <AutoRefresh />
      <PublicHeader />
      <Container className="grid max-w-6xl gap-6">
        <header className="page-hero">
          <p className="page-eyebrow">Chaveamento ao vivo</p>
          <h1 className="page-title">Torneios <strong>ativos</strong></h1>
          <p className="page-lede">Acompanhe as chaves publicadas, confrontos em andamento e campeoes definidos pela organizacao.</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          {tournaments.map((tournament) => (
          <Link className="group block cursor-pointer" key={tournament.id} href={`/torneios/${tournament.game.slug}`}>
            <Panel className="interactive-panel grid min-h-36 content-between gap-4">
              <h2 className="text-xl font-black text-[#A855F7]">{tournament.game.name}</h2>
              <p className="text-sm font-black uppercase text-[#B45CFF]">
                {tournament.game._count.items} confirmado{tournament.game._count.items === 1 ? "" : "s"} - {tournament.status}
              </p>
              <span className="status-pill transition group-hover:bg-[#00FF88] group-hover:text-[#020704]">
                Abrir chave
              </span>
            </Panel>
          </Link>
          ))}
          {tournaments.length === 0 ? <Panel><p>Nenhuma chave disponivel ainda. Assim que houver uma inscricao confirmada em um jogo, ela aparece aqui.</p></Panel> : null}
        </div>
      </Container>
    </div>
  );
}
