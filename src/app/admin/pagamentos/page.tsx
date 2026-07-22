import { Container, Panel } from "@/components/ui";
import { OfxImportForm } from "@/components/ofx-import-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { confirmRegistrationManuallyAction } from "../inscricoes/actions";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ searchParams }: { searchParams?: Promise<{ success?: string; error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      registration: {
        include: {
          participant: true,
          items: { include: { game: true } }
        }
      },
      webhooks: true
    }
  });
  return (
    <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Pagamentos</h1>
      {params?.success ? (
        <div className="border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">
          {params.success}
        </div>
      ) : null}
      {params?.error ? (
        <div className="border border-red-400/45 bg-red-500/10 p-3 text-sm font-black text-red-100">
          {params.error}
        </div>
      ) : null}
      <Panel>
        <h2 className="text-xl font-black text-[#FFD400]">Conciliacao por PDF</h2>
        <p className="mt-2 text-sm leading-6 text-[#D4D4D4]">
          Importe o extrato PDF do banco. O sistema ignora transacoes ja importadas e confirma somente inscricoes pendentes
          quando valor e nome do pagador baterem com a inscricao.
        </p>
        <div className="mt-4">
          <OfxImportForm />
        </div>
      </Panel>
      <Panel className="grid gap-3">
        {payments.map((payment) => (
          <div key={payment.id} className="grid gap-3 border-b border-[#FFD400]/20 py-3 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <strong>{payment.registration.protocol} - {payment.registration.participant.publicName}</strong>
              <p>{payment.provider} - {payment.externalId} - {payment.status} - R$ {Number(payment.amount).toFixed(2)}</p>
              <p className="text-sm text-[#A3A3A3]">
                Inscricao: {payment.registration.status} | Jogos: {payment.registration.items.map((item) => item.game.name).join(", ")} | Webhooks: {payment.webhooks.length}
              </p>
            </div>
            <form action={confirmRegistrationManuallyAction}>
              <input name="registrationId" type="hidden" value={payment.registrationId} />
              <input name="returnTo" type="hidden" value="/admin/pagamentos" />
              <button
                className="focus-ring min-h-10 border border-emerald-400/50 px-3 text-xs font-black uppercase text-emerald-100 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={payment.registration.status === "CONFIRMADA"}
              >
                Liberar manualmente
              </button>
            </form>
          </div>
        ))}
      </Panel>
    </Container>
  );
}
