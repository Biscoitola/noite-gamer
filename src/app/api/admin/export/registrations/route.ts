import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/exports";

export async function GET(request: NextRequest) {
  await requireAdminRole("ADMIN");
  const eventId = request.nextUrl.searchParams.get("eventId") || "";
  const registrations = await prisma.registration.findMany({
    where: eventId ? { eventId } : {},
    include: { participant: true, items: { include: { game: true } } }
  });
  const csv = toCsv(registrations.map((item) => ({
    protocolo: item.protocol,
    status: item.status,
    nick: item.participant.publicName,
    whatsapp: item.participant.whatsapp,
    jogos: item.items.map((entry) => entry.game.name).join("; "),
    duplas: item.items
      .filter((entry) => entry.game.teamMode === "DOUBLES")
      .map((entry) => `${entry.game.name}: ${entry.teamName ?? `${item.participant.publicName} + ${entry.teammateName ?? ""}`}`)
      .join("; "),
    parceiros: item.items
      .filter((entry) => entry.game.teamMode === "DOUBLES")
      .map((entry) => `${entry.teammateName ?? ""} (${entry.teammateWhatsapp ?? ""})`)
      .join("; "),
    cupom: item.couponCode ?? "",
    desconto_cupom: item.couponDiscount,
    valor: item.totalAmount
  })));
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=inscricoes.csv"
    }
  });
}
