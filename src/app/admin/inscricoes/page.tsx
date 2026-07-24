import Link from "next/link";
import { Container, Panel } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cancelRegistrationAction, confirmRegistrationManuallyAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage({ searchParams }: { searchParams?: Promise<{ success?: string; error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { participant: true, items: { include: { game: true } }, payments: true }
  });
  return (
    <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Inscricoes</h1>
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
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="text-[#FFD400]"><th>Protocolo</th><th>Participante</th><th>Contato</th><th>Jogos</th><th>Status</th><th>Valor</th><th>Acoes</th></tr></thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.id} className="border-t border-[#FFD400]/20">
                <td>{registration.protocol}</td>
                <td>{registration.participant.publicName}</td>
                <td>{registration.participant.whatsapp}</td>
                <td>{registration.items.map((item) => item.game.name).join(", ")}</td>
                <td>{registration.status}</td>
                <td>R$ {Number(registration.totalAmount).toFixed(2)}</td>
                <td className="min-w-40">
                  <div className="flex flex-wrap gap-2">
                  <form action={confirmRegistrationManuallyAction}>
                    <input name="registrationId" type="hidden" value={registration.id} />
                    <input name="returnTo" type="hidden" value="/admin/inscricoes" />
                    <button
                      className="focus-ring min-h-9 border border-emerald-400/50 px-3 text-xs font-black uppercase text-emerald-100 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={registration.status === "CONFIRMADA"}
                    >
                      {registration.status === "CANCELADA" ? "Reativar" : "Liberar"}
                    </button>
                  </form>
                  <form action={cancelRegistrationAction}>
                    <input name="registrationId" type="hidden" value={registration.id} />
                    <button
                      className="focus-ring min-h-9 border border-red-500/50 px-3 text-xs font-black uppercase text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={registration.status === "CANCELADA"}
                    >
                      Cancelar
                    </button>
                  </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Link className="text-[#FFD400]" href="/api/admin/export/registrations">Exportar CSV</Link>
    </Container>
  );
}
