import { Container, Panel } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [total, pending, confirmed, paid, games, latest] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "AGUARDANDO_PAGAMENTO" } }),
    prisma.registration.count({ where: { status: "CONFIRMADA" } }),
    prisma.payment.aggregate({ where: { status: "PAGO" }, _sum: { amount: true } }),
    prisma.game.findMany({ include: { _count: { select: { items: true } } } }),
    prisma.registration.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { participant: true } })
  ]);
  return (
    <Container className="grid gap-5">
      <h1 className="text-3xl font-black">Dashboard</h1>
      <section className="grid gap-3 sm:grid-cols-4">
        <Panel><span>Total</span><strong className="block text-3xl text-[#F2B705]">{total}</strong></Panel>
        <Panel><span>Aguardando</span><strong className="block text-3xl text-[#F2B705]">{pending}</strong></Panel>
        <Panel><span>Confirmadas</span><strong className="block text-3xl text-[#F2B705]">{confirmed}</strong></Panel>
        <Panel><span>Receita</span><strong className="block text-3xl text-[#F2B705]">R$ {Number(paid._sum.amount ?? 0).toFixed(2)}</strong></Panel>
      </section>
      <Panel>
        <h2 className="text-xl font-black">Vagas por modalidade</h2>
        <ul className="mt-3 grid gap-2">{games.map((game) => <li key={game.id}>{game.name}: {game._count.items}/{game.capacity}</li>)}</ul>
      </Panel>
      <Panel>
        <h2 className="text-xl font-black">Ultimas inscricoes</h2>
        <ul className="mt-3 grid gap-2">{latest.map((registration) => <li key={registration.id}>{registration.protocol} - {registration.participant.publicName} - {registration.status}</li>)}</ul>
      </Panel>
    </Container>
  );
}
