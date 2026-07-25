import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Container, Panel } from "@/components/ui";
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
            <Link className="focus-ring block" href={`/patrocinadores/${sponsor.id}`} key={sponsor.id}>
              <Panel className="interactive-panel grid min-h-32 gap-4 transition hover:border-[#FFD400]/70">
                <div className="flex flex-wrap items-center gap-4">
                  <img src={sponsor.logoUrl} alt={`Logo ${sponsor.name}`} className="h-24 w-28 object-contain" />
                  <div>
                    <h2 className="text-2xl font-black text-[#FFD400]">{sponsor.name}</h2>
                    <p className="mt-1 text-sm text-[#D4D4D4]">{sponsor.description}</p>
                    <p className="mt-2 text-xs font-black uppercase text-[#B45CFF]">
                      {sponsor.prizes.length > 0
                        ? `${sponsor.prizes.length} premio${sponsor.prizes.length > 1 ? "s" : ""} cedido${sponsor.prizes.length > 1 ? "s" : ""}`
                        : "Ver detalhes"}
                    </p>
                  </div>
                </div>
              </Panel>
            </Link>
          ))}
          {sponsors.length === 0 ? <Panel><p>Nenhum patrocinador publicado no momento.</p></Panel> : null}
        </div>
      </Container>
    </>
  );
}
