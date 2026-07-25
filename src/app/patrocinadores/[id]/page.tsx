import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { Container, Panel } from "@/components/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SponsorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sponsor = await prisma.sponsor.findFirst({
    where: { id, isActive: true, event: { status: "ACTIVE" } },
    include: { prizes: { where: { isActive: true }, orderBy: { createdAt: "desc" } } }
  }).catch(() => null);

  if (!sponsor) notFound();

  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
        <Link className="focus-ring w-fit text-sm font-black uppercase text-[#B45CFF] hover:text-[#FFD400]" href="/patrocinadores">
          Voltar para patrocinadores
        </Link>

        <Panel className="interactive-panel grid gap-6 lg:grid-cols-[320px_1fr] lg:items-center">
          <img src={sponsor.logoUrl} alt={`Logo ${sponsor.name}`} className="h-56 w-full object-contain sm:h-72" />
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Patrocinador oficial</p>
            <h1 className="mt-2 text-4xl font-black text-[#FFD400]">{sponsor.name}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#D4D4D4]">{sponsor.description}</p>
            {sponsor.websiteUrl ? (
              <a
                className="focus-ring mt-5 inline-flex min-h-11 items-center border border-[#FFD400]/70 px-4 text-sm font-black uppercase text-[#FFD400] hover:bg-[#FFD400] hover:text-black"
                href={sponsor.websiteUrl}
                rel="noreferrer"
                target="_blank"
              >
                Visitar patrocinador
              </a>
            ) : null}
          </div>
        </Panel>

        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#B45CFF]">Premios cedidos</p>
            <h2 className="text-3xl font-black text-glow">Brindes e sorteios</h2>
          </div>

          {sponsor.prizes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sponsor.prizes.map((prize) => (
                <Panel className="interactive-panel grid gap-3" key={prize.id}>
                  <img src={prize.imageUrl} alt={prize.title} className="h-48 w-full object-cover" />
                  <div>
                    <h3 className="text-xl font-black text-[#FFD400]">{prize.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#A3A3A3]">{prize.description}</p>
                    <p className="mt-2 text-xs font-black uppercase text-[#B45CFF]">Quantidade: {prize.quantity}</p>
                  </div>
                </Panel>
              ))}
            </div>
          ) : (
            <Panel>
              <p className="text-[#D4D4D4]">Nenhum premio publicado para este patrocinador no momento.</p>
            </Panel>
          )}
        </section>
      </Container>
    </>
  );
}
