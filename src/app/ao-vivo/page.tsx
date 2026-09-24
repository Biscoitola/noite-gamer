import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";
import { AutoRefresh } from "@/components/auto-refresh";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const match = await prisma.match.findFirst({
    where: { status: "READY", tournament: { public: true, game: { event: { status: "ACTIVE" } } } },
    orderBy: [{ tournament: { updatedAt: "desc" } }, { createdAt: "asc" }],
    include: {
      tournament: { include: { game: true } },
      round: true,
      participant1: { include: { participant: true } },
      participant2: { include: { participant: true } }
    }
  }).catch(() => null);
  return (
    <div className="page-shell min-h-screen">
      <AutoRefresh />
      <PublicHeader />
      <Container className="grid min-h-[calc(100vh-72px)] content-center">
      <Panel className="interactive-panel page-hero text-center">
        <p className="page-eyebrow">{match?.tournament.game.name ?? "Nexus Arena"}</p>
        <h1 className="page-title">{match?.round.name ?? "Aguardando partida"}</h1>
        <div className="mt-8 grid gap-4 text-4xl font-black sm:grid-cols-[1fr_auto_1fr]">
          <span>{entryName(match?.participant1)}</span>
          <span className="text-[#00FF88]">VS</span>
          <span>{entryName(match?.participant2)}</span>
        </div>
      </Panel>
      </Container>
    </div>
  );
}

function entryName(entry: { displayName: string | null; participant: { publicName: string } } | null | undefined) {
  return entry?.displayName ?? entry?.participant.publicName ?? "-";
}
