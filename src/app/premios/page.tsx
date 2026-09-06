import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AwardsPage() {
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
            Os premios exibidos aqui pertencem somente a edicao ativa da Nexus Arena.
          </p>
        </header>
        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Edicao ativa</p>
            <h2 className="text-2xl font-black text-glow">Premios cadastrados</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#D4D4D4]">
              Trofeus, brindes e premios cedidos pelos patrocinadores ficam vinculados a uma edicao especifica.
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
            {sponsorPrizes.length === 0 ? <Panel><p>Nenhum premio de patrocinador publicado no momento.</p></Panel> : null}
          </div>
        </section>
      </Container>
    </div>
  );
}

function raffleAudienceLabel(value: string) {
  return value === "TOURNAMENT_WINNERS" ? "Sorteio exclusivo para campeoes" : "Sorteio geral";
}
