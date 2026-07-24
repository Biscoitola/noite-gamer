import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { trophyAwards } from "@/lib/award-showcase";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RafflesPage() {
  const prizes = await prisma.prize.findMany({
    where: { isActive: true, event: { status: "ACTIVE" } },
    include: {
      sponsor: true,
      winnerRegistration: { include: { participant: true } }
    },
    orderBy: [{ drawnAt: "desc" }, { createdAt: "desc" }]
  }).catch(() => []);

  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
        <div>
          <p className="text-sm font-black uppercase text-[#B45CFF]">Tickets e brindes</p>
          <h1 className="text-3xl font-black text-glow">Sorteios</h1>
        </div>
        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#FFD400]">Premiacao dos torneios</p>
            <h2 className="text-2xl font-black text-glow">Trofeus dos campeoes</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {trophyAwards.map((award) => (
              <Panel className="trophy-feature-card interactive-panel grid gap-3" key={award.title}>
                <img src={award.imageUrl} alt={award.title} />
                <div>
                  <p className="text-xs font-black uppercase text-[#B45CFF]">{award.game}</p>
                  <h3 className="text-lg font-black text-[#FFD400]">{award.title}</h3>
                </div>
              </Panel>
            ))}
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prizes.map((prize) => (
            <Panel className="interactive-panel grid gap-3" key={prize.id}>
              <img src={prize.imageUrl} alt={prize.title} className="h-48 w-full object-cover" />
              <div>
                <p className="text-xs font-black uppercase text-[#B45CFF]">{prize.sponsor.name}</p>
                <h2 className="text-xl font-black text-[#FFD400]">{prize.title}</h2>
                <p className="mt-1 text-sm text-[#A3A3A3]">{prize.description}</p>
              </div>
              {prize.winnerRegistration ? (
                <div className="border border-emerald-400/35 bg-emerald-400/10 p-3">
                  <p className="text-xs font-black uppercase text-emerald-200">Ganhador</p>
                  <strong className="text-lg">{prize.winnerRegistration.participant.publicName}</strong>
                  <p className="text-sm text-[#D4D4D4]">Ticket {prize.winnerRegistration.raffleCode ?? prize.winnerRegistration.protocol}</p>
                </div>
              ) : (
                <div className="border border-[#FFD400]/30 bg-[#FFD400]/10 p-3 text-sm font-black uppercase text-[#FFD400]">
                  Aguardando sorteio
                </div>
              )}
            </Panel>
          ))}
          {prizes.length === 0 ? <Panel><p>Nenhum brinde publicado no momento.</p></Panel> : null}
        </div>
      </Container>
    </>
  );
}
