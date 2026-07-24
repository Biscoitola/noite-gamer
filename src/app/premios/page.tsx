import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { trophyAwards } from "@/lib/award-showcase";

export const dynamic = "force-dynamic";

export default function AwardsPage() {
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
      </Container>
    </>
  );
}
