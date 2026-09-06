import Link from "next/link";
import { Container, Panel } from "@/components/ui";
import { AdminEventSelector, type AdminSearchParams, getAdminEventFilter, withEventParam } from "@/lib/admin-event-filter";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams?: Promise<AdminSearchParams> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const { events, selectedEventId } = await getAdminEventFilter(params);
  const eventWhere = selectedEventId ? { eventId: selectedEventId } : {};
  const [total, pending, confirmed, paid, games, latest] = await Promise.all([
    prisma.registration.count({ where: eventWhere }),
    prisma.registration.count({ where: { ...eventWhere, status: "AGUARDANDO_PAGAMENTO" } }),
    prisma.registration.count({ where: { ...eventWhere, status: "CONFIRMADA" } }),
    prisma.payment.aggregate({ where: { status: "PAGO", registration: eventWhere }, _sum: { amount: true } }),
    prisma.game.findMany({ where: eventWhere, include: { _count: { select: { items: true } } } }),
    prisma.registration.findMany({ where: eventWhere, take: 6, orderBy: { createdAt: "desc" }, include: { participant: true } })
  ]);
  return (
    <Container className="grid gap-6">
      <header className="page-hero">
        <p className="page-eyebrow">Central de controle</p>
        <h1 className="page-title">Painel do <strong>admin</strong></h1>
        <p className="page-lede">
          Acompanhe inscricoes, confirme pagamentos, organize chaves e rode sorteios sem sair procurando funcao.
        </p>
      </header>
      <AdminEventSelector events={events} selectedEventId={selectedEventId} params={params} />
      <section className="grid gap-3 sm:grid-cols-4">
        <Metric label="Total" value={String(total)} />
        <Metric label="Aguardando" value={String(pending)} />
        <Metric label="Confirmadas" value={String(confirmed)} />
        <Metric label="Receita" value={`R$ ${Number(paid._sum.amount ?? 0).toFixed(2)}`} />
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminShortcut description="Gerar chaves, alocar jogadores e marcar vencedores." href={withEventParam("/admin/torneios", selectedEventId)} label="Torneios" />
        {admin.role === "ADMIN" ? (
          <>
            <AdminShortcut description="Ver status, participante, WhatsApp e exportar CSV." href={withEventParam("/admin/inscricoes", selectedEventId)} label="Inscricoes" />
            <AdminShortcut description="Conferir Pix, importar arquivos e ajustar confirmacoes." href={withEventParam("/admin/pagamentos", selectedEventId)} label="Pagamentos" />
            <AdminShortcut description="Sortear campeoes e participantes em areas separadas." href={withEventParam("/admin/sorteios", selectedEventId)} label="Sorteios" />
            <AdminShortcut description="Cadastrar apoiadores, logos e premios." href={withEventParam("/admin/patrocinadores", selectedEventId)} label="Patrocinadores" />
            <AdminShortcut description="Criar descontos e acompanhar uso." href={withEventParam("/admin/cupons", selectedEventId)} label="Cupons" />
            <AdminShortcut description="Ajustar evento, capa e carrossel da home." href="/admin/configuracoes" label="Configuracoes" />
            <AdminShortcut description="Liberar ou bloquear acessos da equipe." href="/admin/usuarios" label="Usuarios" />
          </>
        ) : null}
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

function AdminShortcut({ description, href, label }: { description: string; href: string; label: string }) {
  return (
    <Link className="focus-ring neon-card grid min-h-28 content-start gap-2 border border-[#B45CFF]/35 px-4 py-4 text-sm text-[#F5F5F5] transition hover:border-[#00FF88] hover:text-[#00FF88]" href={href}>
      <strong className="font-black uppercase">{label}</strong>
      <span className="text-xs font-bold leading-5 text-[#A3A3A3]">{description}</span>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Panel>
      <span className="text-xs font-black uppercase text-[#A3A3A3]">{label}</span>
      <strong className="block text-3xl text-[#00FF88]">{value}</strong>
    </Panel>
  );
}
