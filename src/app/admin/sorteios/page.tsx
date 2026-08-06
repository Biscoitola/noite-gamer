import Link from "next/link";
import { Container, Panel } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearPrizeWinnerAction, drawPrizeAction } from "../patrocinadores/actions";

export const dynamic = "force-dynamic";

export default async function AdminRafflesPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const prizes = await prisma.prize.findMany({
    include: {
      event: true,
      sponsor: true,
      winnerRegistration: { include: { participant: true } }
    },
    orderBy: [{ drawnAt: "desc" }, { createdAt: "desc" }]
  });
  const pending = prizes.filter((prize) => !prize.winnerRegistrationId).length;
  const drawn = prizes.length - pending;

  return (
    <Container className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">Brindes e ganhadores</p>
        <h1 className="text-3xl font-black text-glow">Sorteios</h1>
      </div>

      <Message type="success" value={readSearchParam(params.success)} />
      <Message type="error" value={readSearchParam(params.error)} />

      <section className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <span>Premios</span>
          <strong className="block text-3xl text-[#FFD400]">{prizes.length}</strong>
        </Panel>
        <Panel>
          <span>Aguardando sorteio</span>
          <strong className="block text-3xl text-[#FFD400]">{pending}</strong>
        </Panel>
        <Panel>
          <span>Sorteados</span>
          <strong className="block text-3xl text-[#FFD400]">{drawn}</strong>
        </Panel>
      </section>

      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#FFD400]">Premios vinculados a patrocinadores</h2>
            <p className="mt-1 text-sm text-[#A3A3A3]">Os premios continuam sendo cadastrados na aba Patrocinadores.</p>
          </div>
          <Link className="focus-ring border border-[#B45CFF]/50 px-3 py-2 text-xs font-black uppercase text-[#F5F5F5]" href="/admin/patrocinadores">
            Cadastrar premio
          </Link>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {prizes.map((prize) => (
            <article className="grid gap-3 border border-[#B45CFF]/30 bg-black/25 p-4" key={prize.id}>
              <div className="flex gap-3">
                <img src={prize.imageUrl} alt={prize.title} className="h-24 w-24 border border-[#FFD400]/30 object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-[#B45CFF]">{prize.event.edition} | {prize.sponsor.name}</p>
                  <h3 className="text-xl font-black text-[#FFD400]">{prize.title}</h3>
                  <p className="mt-1 text-sm text-[#A3A3A3]">{prize.description}</p>
                  <p className="mt-2 text-xs font-black uppercase text-[#D4D4D4]">Quantidade: {prize.quantity}</p>
                </div>
              </div>

              {prize.winnerRegistration ? (
                <div className="border border-emerald-400/35 bg-emerald-400/10 p-3 text-sm">
                  <p className="text-xs font-black uppercase text-emerald-200">Ganhador</p>
                  <strong className="text-lg text-emerald-100">{prize.winnerRegistration.participant.publicName}</strong>
                  <p className="text-[#D4D4D4]">Ticket: {prize.winnerRegistration.raffleCode ?? prize.winnerRegistration.protocol}</p>
                </div>
              ) : (
                <div className="border border-[#FFD400]/30 bg-[#FFD400]/10 p-3 text-sm font-black uppercase text-[#FFD400]">
                  Aguardando sorteio
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <form action={drawPrizeAction}>
                  <input name="prizeId" type="hidden" value={prize.id} />
                  <input name="returnTo" type="hidden" value="/admin/sorteios" />
                  <button className="focus-ring min-h-11 w-full bg-[#FFD400] px-3 text-xs font-black uppercase text-black">
                    {prize.winnerRegistration ? "Sortear novamente" : "Sortear"}
                  </button>
                </form>
                <form action={clearPrizeWinnerAction}>
                  <input name="prizeId" type="hidden" value={prize.id} />
                  <input name="returnTo" type="hidden" value="/admin/sorteios" />
                  <button className="focus-ring min-h-11 w-full border border-[#B45CFF]/50 px-3 text-xs font-black uppercase text-[#F5F5F5]">
                    Limpar ganhador
                  </button>
                </form>
              </div>
            </article>
          ))}
          {prizes.length === 0 ? <p className="text-sm text-[#A3A3A3]">Nenhum premio cadastrado ainda.</p> : null}
        </div>
      </Panel>
    </Container>
  );
}

function Message({ type, value }: { type: "success" | "error"; value?: string }) {
  if (!value) return null;
  return (
    <div className={type === "success" ? "border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100" : "border border-red-400/45 bg-red-500/10 p-3 text-sm font-black text-red-100"}>
      {value}
    </div>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
