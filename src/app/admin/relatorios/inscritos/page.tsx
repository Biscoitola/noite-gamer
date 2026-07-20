import { Container, Field, Panel, inputClass } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RegisteredByGameReportPage({
  searchParams
}: {
  searchParams: Promise<{ jogo?: string; busca?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const games = await prisma.game.findMany({ orderBy: { name: "asc" }, include: { event: true } });
  const selectedGameId = params.jogo || games[0]?.id || "";
  const search = (params.busca || "").trim();
  const status = params.status || "";

  const items = selectedGameId
    ? await prisma.registrationItem.findMany({
        where: {
          gameId: selectedGameId,
          registration: {
            ...(status ? { status: status as never } : {}),
            ...(search
              ? {
                  OR: [
                    { protocol: { contains: search, mode: "insensitive" } },
                    { participant: { fullName: { contains: search, mode: "insensitive" } } },
                    { participant: { publicName: { contains: search, mode: "insensitive" } } },
                    { participant: { whatsapp: { contains: search, mode: "insensitive" } } },
                    { participant: { email: { contains: search, mode: "insensitive" } } }
                  ]
                }
              : {})
          }
        },
        include: {
          game: { include: { event: true } },
          checkIns: true,
          registration: {
            include: {
              participant: true,
              payments: { orderBy: { createdAt: "desc" }, take: 1 }
            }
          }
        },
        orderBy: [{ registration: { participant: { publicName: "asc" } } }]
      })
    : [];

  const selectedGame = games.find((game) => game.id === selectedGameId);
  const confirmed = items.filter((item) => item.registration.status === "CONFIRMADA").length;
  const pending = items.filter((item) => item.registration.status === "AGUARDANDO_PAGAMENTO").length;
  const paid = items.filter((item) => item.registration.payments[0]?.status === "PAGO").length;
  const checkedIn = items.filter((item) => item.checkIns.some((checkIn) => !checkIn.canceledAt)).length;

  return (
    <Container className="grid max-w-7xl gap-5">
      <div className="no-print">
        <p className="text-sm font-black uppercase text-[#B45CFF]">Relatorio administrativo</p>
        <h1 className="text-3xl font-black text-glow">Inscritos por jogo</h1>
      </div>

      <Panel className="no-print">
        <form className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
          <Field label="Jogo">
            <select className={inputClass} name="jogo" defaultValue={selectedGameId}>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.event.edition} - {game.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Busca">
            <input className={inputClass} name="busca" defaultValue={search} placeholder="Nome, nick, WhatsApp, protocolo" />
          </Field>
          <Field label="Status da inscricao">
            <select className={inputClass} name="status" defaultValue={status}>
              <option value="">Todos</option>
              <option value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="EXPIRADA">Expirada</option>
              <option value="REEMBOLSADA">Reembolsada</option>
            </select>
          </Field>
          <div className="flex items-end gap-2">
            <button className="min-h-12 bg-[#B45CFF] px-4 font-black uppercase text-white">Filtrar</button>
            <PrintButton />
          </div>
        </form>
      </Panel>

      <section className="print-report grid gap-4">
        <header className="border-b border-[#F2B705]/35 pb-4">
          <p className="text-sm font-black uppercase text-[#B45CFF]">Noite Gamer</p>
          <h2 className="text-2xl font-black">{selectedGame ? `${selectedGame.event.edition} - ${selectedGame.name}` : "Relatorio"}</h2>
          <p className="text-sm text-[#A3A3A3]">Gerado em {new Date().toLocaleString("pt-BR")}</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-5">
          <Metric label="Total" value={items.length} />
          <Metric label="Confirmadas" value={confirmed} />
          <Metric label="Pendentes" value={pending} />
          <Metric label="Pagas" value={paid} />
          <Metric label="Check-in" value={checkedIn} />
        </div>

        <Panel className="overflow-x-auto print-table-panel">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#F2B705]/40 text-[#F2B705]">
                <th className="py-2">#</th>
                <th>Nome</th>
                <th>Nick</th>
                <th>WhatsApp</th>
                <th>E-mail</th>
                <th>Cidade</th>
                <th>Protocolo</th>
                <th>Inscricao</th>
                <th>Pagamento</th>
                <th>Valor</th>
                <th>Check-in</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const payment = item.registration.payments[0];
                const isCheckedIn = item.checkIns.some((checkIn) => !checkIn.canceledAt);
                return (
                  <tr className="border-b border-[#B45CFF]/20" key={item.id}>
                    <td className="py-2">{index + 1}</td>
                    <td>{item.registration.participant.fullName}</td>
                    <td className="font-black text-[#F2B705]">{item.registration.participant.publicName}</td>
                    <td>{item.registration.participant.whatsapp}</td>
                    <td>{item.registration.participant.email ?? "-"}</td>
                    <td>{item.registration.participant.city}</td>
                    <td>{item.registration.protocol}</td>
                    <td>{item.registration.status}</td>
                    <td>{payment?.status ?? "SEM_PAGAMENTO"}</td>
                    <td>R$ {Number(item.finalPrice).toFixed(2)}</td>
                    <td>{isCheckedIn ? "Presente" : "Pendente"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </section>
    </Container>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#B45CFF]/35 bg-[#111111] p-3">
      <span className="text-xs font-black uppercase text-[#A3A3A3]">{label}</span>
      <strong className="block text-2xl text-[#F2B705]">{value}</strong>
    </div>
  );
}
