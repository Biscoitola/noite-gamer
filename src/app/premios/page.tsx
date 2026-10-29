import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";
import { getEditionPrizePool } from "@/lib/prize-pool";
import { PrizePool } from "@/components/prize-pool";
import { EmporiumAwards } from "@/components/emporium-awards";

export const dynamic = "force-dynamic";

export default async function AwardsPage() {
  const event = await prisma.event.findFirst({ where: { status: "ACTIVE" }, orderBy: { startsAt: "desc" } }).catch(() => null);
  const prizePool = event ? await getEditionPrizePool(event).catch(() => null) : null;
  const sponsorPrizes = await prisma.prize.findMany({
    where: { isActive: true, event: { status: "ACTIVE" } },
    include: { sponsor: true },
    orderBy: { createdAt: "desc" }
  }).catch(() => []);

  return (
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-6xl gap-6">
        <header className="page-hero">
          <p className="page-eyebrow">Premiacao oficial</p>
          <h1 className="page-title">Premios e <strong>trofeus</strong></h1>
          <p className="page-lede">
            Confira a premiação do The Games Emporium e os prêmios dos patrocinadores da Nexus Arena.
          </p>
        </header>
        <EmporiumAwards />
        <PrizePool pool={prizePool} />
        {sponsorPrizes.length > 0 ? <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Edicao ativa</p>
            <h2 className="text-2xl font-black text-glow">Premios dos patrocinadores</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#D4D4D4]">
              Brindes e premios cedidos pelos patrocinadores desta edicao.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sponsorPrizes.map((prize) => (
              <Panel className="interactive-panel grid gap-3" key={prize.id}>
                <img src={prize.imageUrl} alt={prize.title} className="h-56 w-full rounded-[6px] border border-[#B45CFF]/25 object-cover" />
                <div>
                  <p className="text-xs font-black uppercase text-[#B45CFF]">{prize.sponsor.name}</p>
                  <h3 className="text-xl font-black text-[#A855F7]">{prize.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#A3A3A3]">{prize.description}</p>
                  <p className="mt-2 text-xs font-black uppercase text-[#B45CFF]">Quantidade: {prize.quantity}</p>
                  <p className="mt-1 text-xs font-black uppercase text-[#A855F7]">{raffleAudienceLabel(prize.raffleAudience)}</p>
                </div>
              </Panel>
            ))}
          </div>
        </section> : null}
      </Container>
    </div>
  );
}

function raffleAudienceLabel(value: string) {
  return value === "TOURNAMENT_WINNERS" ? "Sorteio exclusivo para campeoes" : "Sorteio geral";
}
