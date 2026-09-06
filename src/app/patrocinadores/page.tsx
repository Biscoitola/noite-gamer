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
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-6xl gap-6">
        <header className="page-hero">
          <p className="page-eyebrow">Apoiadores oficiais</p>
          <h1 className="page-title">Patrocinadores</h1>
          <p className="page-lede">Marcas e parceiros que fortalecem a Nexus Arena, os brindes, a premiacao e a experiencia presencial.</p>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          {sponsors.map((sponsor) => (
            <Link className="focus-ring block" href={`/patrocinadores/${sponsor.id}`} key={sponsor.id}>
              <Panel className="interactive-panel grid min-h-32 gap-4 transition hover:border-[#A855F7]/70">
                <div className="flex flex-wrap items-center gap-4">
                  <img src={sponsor.logoUrl} alt={`Logo ${sponsor.name}`} className="h-24 w-28 rounded-[6px] border border-[#B45CFF]/25 bg-black/30 object-contain p-2" />
                  <div>
                    <h2 className="text-2xl font-black text-[#A855F7]">{sponsor.name}</h2>
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
    </div>
  );
}
