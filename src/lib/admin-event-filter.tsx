import { Field, Panel, inputClass } from "@/components/ui";
import { prisma } from "@/lib/db";

export type AdminSearchParams = Record<string, string | string[] | undefined>;

export async function getAdminEventFilter(params: AdminSearchParams | undefined) {
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });
  const requestedEventId = readSearchParam(params?.eventId);
  const selectedEvent = events.find((event) => event.id === requestedEventId) ?? events.find((event) => event.status === "ACTIVE") ?? events[0] ?? null;

  return {
    events,
    selectedEvent,
    selectedEventId: selectedEvent?.id ?? ""
  };
}

export function AdminEventSelector({
  events,
  selectedEventId,
  params
}: {
  events: { id: string; name: string; edition: string; status: string }[];
  selectedEventId: string;
  params?: AdminSearchParams;
}) {
  return (
    <Panel className="no-print">
      <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        {hiddenParams(params)}
        <Field label="Edicao exibida">
          <select className={inputClass} name="eventId" defaultValue={selectedEventId}>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {event.edition} ({event.status})
              </option>
            ))}
          </select>
        </Field>
        <button className="neon-action min-h-12 px-5 font-black uppercase">Aplicar edicao</button>
      </form>
    </Panel>
  );
}

export function withEventParam(path: string, eventId: string) {
  return eventId ? `${path}?eventId=${encodeURIComponent(eventId)}` : path;
}

export function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hiddenParams(params: AdminSearchParams | undefined) {
  if (!params) return null;
  return Object.entries(params)
    .filter(([key, value]) => !["eventId", "success", "error"].includes(key) && value != null)
    .flatMap(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values.map((item, index) => <input key={`${key}-${index}`} name={key} type="hidden" value={item} />);
    });
}
