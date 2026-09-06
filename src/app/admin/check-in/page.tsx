import { Container, Field, Panel, inputClass } from "@/components/ui";
import { AdminEventSelector, type AdminSearchParams, getAdminEventFilter, readSearchParam } from "@/lib/admin-event-filter";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkInAction, undoCheckInAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
  searchParams
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  await requireAdminRole("ADMIN");
  const params = await searchParams;
  const { events, selectedEventId } = await getAdminEventFilter(params);
  const search = (readSearchParam(params.busca) || "").trim();
  const selectedGame = readSearchParam(params.jogo) || "";
  const presence = readSearchParam(params.presenca) || "";
  const games = await prisma.game.findMany({ where: { isActive: true, ...(selectedEventId ? { eventId: selectedEventId } : {}) }, orderBy: { name: "asc" } });
  const items = await prisma.registrationItem.findMany({
    where: {
      status: "CONFIRMED",
      ...(selectedEventId ? { game: { eventId: selectedEventId } } : {}),
      ...(selectedGame ? { gameId: selectedGame } : {}),
      ...(presence === "presentes" ? { checkIns: { some: { canceledAt: null } } } : {}),
      ...(presence === "ausentes" ? { checkIns: { none: { canceledAt: null } } } : {}),
      ...(search
        ? {
            registration: {
              status: "CONFIRMADA",
              OR: [
                { protocol: { contains: search, mode: "insensitive" } },
                { participant: { publicName: { contains: search, mode: "insensitive" } } },
                { participant: { whatsapp: { contains: search, mode: "insensitive" } } }
              ]
            }
          }
        : { registration: { status: "CONFIRMADA" } })
    },
    include: { game: true, registration: { include: { participant: true } }, checkIns: true },
    orderBy: [{ game: { name: "asc" } }, { registration: { participant: { publicName: "asc" } } }]
  });
  const presentCount = items.filter((item) => item.checkIns.some((checkIn) => !checkIn.canceledAt)).length;
  return (
    <Container className="grid max-w-7xl gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">Entrada do evento</p>
        <h1 className="text-3xl font-black text-glow">Check-in rapido</h1>
      </div>
      <AdminEventSelector events={events} selectedEventId={selectedEventId} params={params} />

      <Panel className="interactive-panel">
        <form className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <input name="eventId" type="hidden" value={selectedEventId} />
          <Field label="Buscar participante">
            <input className={inputClass} name="busca" defaultValue={search} placeholder="Nick, WhatsApp ou protocolo" autoFocus />
          </Field>
          <Field label="Jogo">
            <select className={inputClass} name="jogo" defaultValue={selectedGame}>
              <option value="">Todos os jogos</option>
              {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
            </select>
          </Field>
          <Field label="Presenca">
            <select className={inputClass} name="presenca" defaultValue={presence}>
              <option value="">Todos</option>
              <option value="ausentes">Ausentes</option>
              <option value="presentes">Presentes</option>
            </select>
          </Field>
          <button className="mt-7 min-h-12 bg-[#B45CFF] px-5 font-black uppercase text-white">Filtrar</button>
        </form>
      </Panel>

      <section className="grid gap-3 sm:grid-cols-3">
        <Panel><span className="text-sm text-[#A3A3A3]">Listados</span><strong className="block text-3xl text-[#A855F7]">{items.length}</strong></Panel>
        <Panel><span className="text-sm text-[#A3A3A3]">Presentes</span><strong className="block text-3xl text-[#A855F7]">{presentCount}</strong></Panel>
        <Panel><span className="text-sm text-[#A3A3A3]">Ausentes</span><strong className="block text-3xl text-[#A855F7]">{items.length - presentCount}</strong></Panel>
      </section>

      <Panel className="grid gap-3">
        <h2 className="text-xl font-black text-[#A855F7]">Participantes confirmados</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const present = item.checkIns.some((checkIn) => !checkIn.canceledAt);
            return (
              <article className={`grid gap-3 border p-3 ${present ? "border-[#A855F7] bg-[#A855F7]/10" : "border-[#B45CFF]/35 bg-black/30"}`} key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">{entryLabel(item)}</h3>
                    {item.game.teamMode === "DOUBLES" && item.teammateName ? (
                      <p className="text-sm text-[#A3A3A3]">Parceiro: {item.teammateName}</p>
                    ) : null}
                  </div>
                  <span className={`text-xs font-black uppercase ${present ? "text-[#A855F7]" : "text-[#B45CFF]"}`}>
                    {present ? "Presente" : "Ausente"}
                  </span>
                </div>
                <dl className="grid gap-1 text-sm text-[#D4D4D4]">
                  <div className="flex justify-between gap-3"><dt>Jogo</dt><dd className="font-black">{item.game.name}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Protocolo</dt><dd>{item.registration.protocol}</dd></div>
                  <div className="flex justify-between gap-3"><dt>WhatsApp</dt><dd>{item.registration.participant.whatsapp}</dd></div>
                </dl>
                {present ? (
                  <form action={undoCheckInAction}>
                    <input type="hidden" name="registrationItemId" value={item.id} />
                    <button className="min-h-11 w-full border border-[#B45CFF] px-3 font-black uppercase text-[#F5F5F5] hover:border-[#A855F7] hover:text-[#A855F7]">
                      Desfazer check-in
                    </button>
                  </form>
                ) : (
                  <form action={checkInAction}>
                    <input type="hidden" name="registrationItemId" value={item.id} />
                    <button className="neon-action min-h-11 w-full px-3 font-black uppercase">
                      Fazer check-in
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </div>
        {items.length === 0 ? <p className="text-[#A3A3A3]">Nenhum participante encontrado para os filtros atuais.</p> : null}
      </Panel>
    </Container>
  );
}

function entryLabel(item: {
  teamName: string | null;
  teammateName: string | null;
  game: { teamMode: string };
  registration: { participant: { publicName: string } };
}) {
  if (item.game.teamMode !== "DOUBLES") return item.registration.participant.publicName;
  if (item.teamName) return item.teamName;
  if (item.teammateName) return `${item.registration.participant.publicName} + ${item.teammateName}`;
  return item.registration.participant.publicName;
}
