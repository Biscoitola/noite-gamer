import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const match = await prisma.match.findFirst({
    where: { status: "READY", tournament: { public: true } },
    orderBy: [{ tournament: { updatedAt: "desc" } }, { createdAt: "asc" }],
    include: {
      tournament: { include: { game: true } },
      round: true,
      participant1: { include: { participant: true } },
      participant2: { include: { participant: true } }
    }
  }).catch(() => null);
  return (
    <>
      <PublicHeader />
      <Container className="grid min-h-[calc(100vh-72px)] content-center">
      <Panel className="interactive-panel text-center">
        <p className="text-[#FFD400]">{match?.tournament.game.name ?? "Noite Gamer"}</p>
        <h1 className="mt-3 text-5xl font-black">{match?.round.name ?? "Aguardando partida"}</h1>
        <div className="mt-8 grid gap-4 text-4xl font-black sm:grid-cols-[1fr_auto_1fr]">
          <span>{match?.participant1?.participant.publicName ?? "-"}</span>
          <span className="text-[#FFD400]">VS</span>
          <span>{match?.participant2?.participant.publicName ?? "-"}</span>
        </div>
      </Panel>
      </Container>
    </>
  );
}
