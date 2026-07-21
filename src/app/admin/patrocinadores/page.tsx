import { Container, Field, Panel, inputClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearPrizeWinnerAction, createPrizeAction, createSponsorAction, drawPrizeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  await requireAdmin();
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });
  const sponsors = await prisma.sponsor.findMany({
    include: {
      event: true,
      prizes: {
        orderBy: { createdAt: "desc" },
        include: { winnerRegistration: { include: { participant: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <Container className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">Patrocinio e brindes</p>
        <h1 className="text-3xl font-black text-glow">Patrocinadores e sorteios</h1>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-xl font-black text-[#FFD400]">Cadastrar patrocinador</h2>
          <form action={createSponsorAction} className="mt-4 grid gap-3">
            <Field label="Evento">
              <select className={inputClass} name="eventId" required>
                {events.map((event) => <option key={event.id} value={event.id}>{event.name} - {event.edition}</option>)}
              </select>
            </Field>
            <Field label="Nome"><input className={inputClass} name="name" required /></Field>
            <Field label="URL da logo"><input className={inputClass} name="logoUrl" required placeholder="https://..." /></Field>
            <Field label="Site ou Instagram"><input className={inputClass} name="websiteUrl" placeholder="https://..." /></Field>
            <Field label="Descricao"><textarea className={inputClass} name="description" rows={3} /></Field>
            <label className="flex min-h-12 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
              <input name="isActive" type="checkbox" defaultChecked /> Mostrar no site
            </label>
            <button className="focus-ring min-h-12 bg-[#FFD400] px-4 font-black uppercase text-black">Salvar patrocinador</button>
          </form>
        </Panel>

        <Panel>
          <h2 className="text-xl font-black text-[#FFD400]">Cadastrar brinde</h2>
          <form action={createPrizeAction} className="mt-4 grid gap-3">
            <Field label="Patrocinador">
              <select className={inputClass} name="sponsorId" required>
                {sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name} - {sponsor.event.edition}</option>)}
              </select>
            </Field>
            <Field label="Nome do brinde"><input className={inputClass} name="title" required /></Field>
            <Field label="URL da foto do brinde"><input className={inputClass} name="imageUrl" required placeholder="https://..." /></Field>
            <Field label="Descricao"><textarea className={inputClass} name="description" rows={3} /></Field>
            <Field label="Quantidade"><input className={inputClass} name="quantity" min="1" type="number" defaultValue="1" /></Field>
            <label className="flex min-h-12 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
              <input name="isActive" type="checkbox" defaultChecked /> Mostrar no site
            </label>
            <button className="focus-ring min-h-12 bg-[#B45CFF] px-4 font-black uppercase text-white">Salvar brinde</button>
          </form>
        </Panel>
      </section>

      <Panel>
        <h2 className="text-xl font-black">Itens cadastrados</h2>
        <div className="mt-4 grid gap-4">
          {sponsors.map((sponsor) => (
            <article className="border border-[#B45CFF]/30 bg-black/25 p-4" key={sponsor.id}>
              <div className="flex flex-wrap items-center gap-4">
                <img src={sponsor.logoUrl} alt={`Logo ${sponsor.name}`} className="size-16 border border-[#FFD400]/40 bg-white object-contain p-1" />
                <div>
                  <h3 className="text-lg font-black text-[#FFD400]">{sponsor.name}</h3>
                  <p className="text-sm text-[#A3A3A3]">{sponsor.event.edition} - {sponsor.isActive ? "visivel" : "oculto"}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {sponsor.prizes.map((prize) => (
                  <div className="grid gap-3 border border-[#FFD400]/25 bg-[#111111] p-3" key={prize.id}>
                    <div className="flex gap-3">
                      <img src={prize.imageUrl} alt={prize.title} className="size-20 border border-[#B45CFF]/35 object-cover" />
                      <div>
                        <strong>{prize.title}</strong>
                        <p className="text-sm text-[#A3A3A3]">{prize.description}</p>
                        <p className="text-xs uppercase text-[#B45CFF]">Qtd {prize.quantity}</p>
                      </div>
                    </div>
                    {prize.winnerRegistration ? (
                      <div className="border border-emerald-400/35 bg-emerald-400/10 p-3 text-sm">
                        <strong className="text-emerald-200">Ganhador: {prize.winnerRegistration.participant.publicName}</strong>
                        <p>{prize.winnerRegistration.participant.fullName}</p>
                        <p>Ticket: {prize.winnerRegistration.raffleCode ?? prize.winnerRegistration.protocol}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#A3A3A3]">Ainda nao sorteado.</p>
                    )}
                    <div className="grid gap-2 sm:grid-cols-2">
                      <form action={drawPrizeAction}>
                        <input name="prizeId" type="hidden" value={prize.id} />
                        <button className="focus-ring min-h-10 w-full bg-[#FFD400] px-3 text-xs font-black uppercase text-black">Sortear</button>
                      </form>
                      <form action={clearPrizeWinnerAction}>
                        <input name="prizeId" type="hidden" value={prize.id} />
                        <button className="focus-ring min-h-10 w-full border border-[#B45CFF]/50 px-3 text-xs font-black uppercase text-[#F5F5F5]">Limpar</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </Container>
  );
}
