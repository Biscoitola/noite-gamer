import Link from "next/link";
import { Container, Panel } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  await requireAdmin();
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { participant: true, items: { include: { game: true } }, payments: true }
  });
  return (
    <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Inscricoes</h1>
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="text-[#FFD400]"><th>Protocolo</th><th>Participante</th><th>Contato</th><th>Jogos</th><th>Status</th><th>Valor</th></tr></thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.id} className="border-t border-[#FFD400]/20">
                <td>{registration.protocol}</td>
                <td>{registration.participant.publicName}</td>
                <td>{registration.participant.whatsapp}</td>
                <td>{registration.items.map((item) => item.game.name).join(", ")}</td>
                <td>{registration.status}</td>
                <td>R$ {Number(registration.totalAmount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Link className="text-[#FFD400]" href="/api/admin/export/registrations">Exportar CSV</Link>
    </Container>
  );
}
