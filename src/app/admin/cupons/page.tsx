import { Container, Field, Panel, inputClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCouponAction, updateCouponAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });
  const coupons = await prisma.discountCoupon.findMany({
    include: { event: true },
    orderBy: [{ isActive: "desc" }, { expiresAt: "desc" }]
  });
  const now = new Date();

  return (
    <Container className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">Promocoes relampago</p>
        <h1 className="text-3xl font-black text-glow">Cupons de desconto</h1>
      </div>
      <Message type="success" value={readSearchParam(params?.success)} />
      <Message type="error" value={readSearchParam(params?.error)} />

      <Panel className="interactive-panel">
        <h2 className="text-xl font-black text-[#FFD400]">Cadastrar cupom</h2>
        <form action={createCouponAction} className="mt-4 grid gap-3">
          <div className="grid gap-3 lg:grid-cols-3">
            <Field label="Edicao">
              <select className={inputClass} name="eventId" required>
                {events.map((event) => <option key={event.id} value={event.id}>{event.name} - {event.edition}</option>)}
              </select>
            </Field>
            <Field label="Codigo">
              <input className={inputClass} name="code" required placeholder="RELAMPAGO10" />
            </Field>
            <Field label="Tipo">
              <select className={inputClass} name="type" defaultValue="PERCENT">
                <option value="PERCENT">Percentual (%)</option>
                <option value="FIXED">Valor fixo (R$)</option>
              </select>
            </Field>
            <Field label="Valor">
              <input className={inputClass} name="value" min="0.01" step="0.01" type="number" required />
            </Field>
            <Field label="Inicio">
              <input className={inputClass} name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(now)} />
            </Field>
            <Field label="Fim">
              <input className={inputClass} name="expiresAt" type="datetime-local" defaultValue={toDateTimeLocal(new Date(now.getTime() + 60 * 60_000))} />
            </Field>
            <Field label="Duracao em minutos">
              <input className={inputClass} name="durationMinutes" min="1" type="number" placeholder="Opcional" />
            </Field>
            <Field label="Limite de usos">
              <input className={inputClass} name="maxUses" min="1" type="number" placeholder="Sem limite" />
            </Field>
            <Field label="Descricao">
              <input className={inputClass} name="description" placeholder="Cupom relampago para inscricoes" />
            </Field>
          </div>
          <label className="flex min-h-12 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
            <input name="isActive" type="checkbox" defaultChecked /> Cupom ativo
          </label>
          <button className="focus-ring min-h-12 bg-[#FFD400] px-4 font-black uppercase text-black">Salvar cupom</button>
        </form>
      </Panel>

      <Panel>
        <h2 className="text-xl font-black">Cupons cadastrados</h2>
        <div className="mt-4 grid gap-4">
          {coupons.map((coupon) => {
            const expired = coupon.expiresAt < now;
            const notStarted = coupon.startsAt > now;
            const usesLabel = coupon.maxUses == null ? `${coupon.usedCount} usos` : `${coupon.usedCount}/${coupon.maxUses} usos`;
            return (
              <article className="border border-[#B45CFF]/30 bg-black/25 p-4" key={coupon.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-[#FFD400]">{coupon.code}</h3>
                    <p className="mt-1 text-sm text-[#D4D4D4]">{coupon.description}</p>
                    <p className="mt-2 text-xs font-black uppercase text-[#B45CFF]">
                      {coupon.event.edition} | {coupon.type === "PERCENT" ? `${Number(coupon.value).toFixed(2)}%` : `R$ ${Number(coupon.value).toFixed(2)}`} | {usesLabel}
                    </p>
                  </div>
                  <span className={coupon.isActive && !expired ? "text-xs font-black uppercase text-emerald-300" : "text-xs font-black uppercase text-[#A3A3A3]"}>
                    {!coupon.isActive ? "Inativo" : expired ? "Expirado" : notStarted ? "Agendado" : "Ativo"}
                  </span>
                </div>

                <form action={updateCouponAction} className="mt-4 grid gap-3 border border-[#FFD400]/25 bg-[#111111] p-3">
                  <input name="couponId" type="hidden" value={coupon.id} />
                  <div className="grid gap-3 lg:grid-cols-3">
                    <Field label="Tipo">
                      <select className={inputClass} name="type" defaultValue={coupon.type}>
                        <option value="PERCENT">Percentual (%)</option>
                        <option value="FIXED">Valor fixo (R$)</option>
                      </select>
                    </Field>
                    <Field label="Valor">
                      <input className={inputClass} name="value" min="0.01" step="0.01" type="number" defaultValue={Number(coupon.value).toFixed(2)} />
                    </Field>
                    <Field label="Limite de usos">
                      <input className={inputClass} name="maxUses" min="1" type="number" defaultValue={coupon.maxUses ?? ""} placeholder="Sem limite" />
                    </Field>
                    <Field label="Inicio">
                      <input className={inputClass} name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(coupon.startsAt)} />
                    </Field>
                    <Field label="Fim">
                      <input className={inputClass} name="expiresAt" type="datetime-local" defaultValue={toDateTimeLocal(coupon.expiresAt)} />
                    </Field>
                    <Field label="Nova duracao em minutos">
                      <input className={inputClass} name="durationMinutes" min="1" type="number" placeholder="Opcional" />
                    </Field>
                    <Field label="Descricao">
                      <input className={inputClass} name="description" defaultValue={coupon.description} />
                    </Field>
                  </div>
                  <label className="flex min-h-11 items-center gap-3 border border-[#B45CFF]/35 bg-black/30 px-3 text-sm font-black">
                    <input name="isActive" type="checkbox" defaultChecked={coupon.isActive} /> Cupom ativo
                  </label>
                  <button className="focus-ring min-h-11 bg-[#B45CFF] px-3 text-xs font-black uppercase text-white">
                    Salvar cupom
                  </button>
                </form>
              </article>
            );
          })}
          {coupons.length === 0 ? <p className="text-sm text-[#A3A3A3]">Nenhum cupom cadastrado.</p> : null}
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

function toDateTimeLocal(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}
