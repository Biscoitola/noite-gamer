import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({
    where: { isActive: true, event: { status: "ACTIVE" } },
    include: { prizes: { where: { isActive: true }, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" }
  }).catch(() => []);

  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
        <div>
          <p className="text-sm font-black uppercase text-[#B45CFF]">Apoiadores oficiais</p>
          <h1 className="text-3xl font-black text-glow">Patrocinadores</h1>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {sponsors.map((sponsor) => (
            <Panel className="interactive-panel grid gap-4" key={sponsor.id}>
              <div className="flex flex-wrap items-center gap-4">
                <img src={sponsor.logoUrl} alt={`Logo ${sponsor.name}`} className="size-24 border border-[#FFD400]/40 bg-white object-contain p-2" />
                <div>
                  <h2 className="text-2xl font-black text-[#FFD400]">{sponsor.name}</h2>
                  <p className="mt-1 text-sm text-[#D4D4D4]">{sponsor.description}</p>
                </div>
              </div>
              {sponsor.prizes.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sponsor.prizes.map((prize) => (
                    <div className="border border-[#B45CFF]/30 bg-black/30 p-3" key={prize.id}>
                      <img src={prize.imageUrl} alt={prize.title} className="h-40 w-full object-cover" />
                      <h3 className="mt-3 font-black text-[#FFD400]">{prize.title}</h3>
                      <p className="mt-1 text-sm text-[#A3A3A3]">{prize.description}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </Panel>
          ))}
          {sponsors.length === 0 ? <Panel><p>Nenhum patrocinador publicado no momento.</p></Panel> : null}
        </div>
      </Container>
    </>
  );
}
