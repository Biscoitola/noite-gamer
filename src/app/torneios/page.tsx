import Link from "next/link";
import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({ where: { public: true }, include: { game: true } }).catch(() => []);
  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
        <h1 className="text-3xl font-black text-glow">Torneios</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          {tournaments.map((tournament) => (
          <Link className="group block cursor-pointer" key={tournament.id} href={`/torneios/${tournament.game.slug}`}>
            <Panel className="interactive-panel grid min-h-36 content-between gap-4">
              <h2 className="text-xl font-black text-[#F2B705]">{tournament.game.name}</h2>
              <p className="text-sm font-black uppercase text-[#B45CFF]">{tournament.status}</p>
              <span className="inline-flex min-h-10 w-fit items-center border border-[#F2B705] px-3 text-xs font-black uppercase text-[#F2B705] transition group-hover:bg-[#F2B705] group-hover:text-black">
                Abrir chave
              </span>
            </Panel>
          </Link>
          ))}
          {tournaments.length === 0 ? <Panel><p>Nenhum chaveamento publicado no momento.</p></Panel> : null}
        </div>
      </Container>
    </>
  );
}
