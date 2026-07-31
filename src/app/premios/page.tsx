import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { trophyAwards } from "@/lib/award-showcase";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AwardsPage() {
  const sponsorPrizes = await prisma.prize.findMany({
    where: { isActive: true, event: { status: "ACTIVE" } },
    include: { sponsor: true },
    orderBy: { createdAt: "desc" }
  }).catch(() => []);

  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
        <div>
          <p className="text-sm font-black uppercase text-[#B45CFF]">Premiacao oficial</p>
          <h1 className="text-3xl font-black text-glow">Premios e trofeus</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#D4D4D4]">
            Os campeoes de cada modalidade recebem trofeus personalizados da Noite Gamer.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {trophyAwards.map((award) => (
            <Panel className="trophy-feature-card interactive-panel grid gap-3" key={award.title}>
              <img src={award.imageUrl} alt={award.title} />
              <div>
                <p className="text-xs font-black uppercase text-[#B45CFF]">{award.game}</p>
                <h2 className="text-xl font-black text-[#FFD400]">{award.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#A3A3A3]">{award.description}</p>
              </div>
            </Panel>
          ))}
        </div>
        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Brindes dos patrocinadores</p>
            <h2 className="text-2xl font-black text-glow">Premios para sorteio</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#D4D4D4]">
              Estes premios foram cedidos pelos patrocinadores e ficam vinculados aos sorteios da Noite Gamer.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sponsorPrizes.map((prize) => (
              <Panel className="interactive-panel grid gap-3" key={prize.id}>
                <img src={prize.imageUrl} alt={prize.title} className="h-48 w-full object-cover" />
                <div>
                  <p className="text-xs font-black uppercase text-[#B45CFF]">{prize.sponsor.name}</p>
                  <h3 className="text-xl font-black text-[#FFD400]">{prize.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#A3A3A3]">{prize.description}</p>
                  <p className="mt-2 text-xs font-black uppercase text-[#B45CFF]">Quantidade: {prize.quantity}</p>
                </div>
              </Panel>
            ))}
            {sponsorPrizes.length === 0 ? <Panel><p>Nenhum premio de patrocinador publicado no momento.</p></Panel> : null}
          </div>
        </section>
      </Container>
    </>
  );
}
