import { Container, Panel } from "@/components/ui";
import { OfxImportForm } from "@/components/ofx-import-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await requireAdmin();
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, include: { registration: true, webhooks: true } });
  return (
    <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Pagamentos</h1>
      <Panel>
        <h2 className="text-xl font-black text-[#F2B705]">Conciliacao por PDF</h2>
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
          <div key={payment.id} className="border-b border-[#F2B705]/20 py-3">
            <strong>{payment.registration.protocol}</strong>
            <p>{payment.provider} - {payment.externalId} - {payment.status} - R$ {Number(payment.amount).toFixed(2)}</p>
            <p className="text-sm text-[#A3A3A3]">Webhooks: {payment.webhooks.length}</p>
          </div>
        ))}
      </Panel>
    </Container>
  );
}
