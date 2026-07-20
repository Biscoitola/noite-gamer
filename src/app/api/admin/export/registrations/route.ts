import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toCsv } from "@/lib/exports";

export async function GET() {
  await requireAdmin();
  const registrations = await prisma.registration.findMany({ include: { participant: true, items: { include: { game: true } } } });
  const csv = toCsv(registrations.map((item) => ({
    protocolo: item.protocol,
    status: item.status,
    participante: item.participant.fullName,
    nome_publico: item.participant.publicName,
    whatsapp: item.participant.whatsapp,
    jogos: item.items.map((entry) => entry.game.name).join("; "),
    valor: item.totalAmount
  })));
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=inscricoes.csv"
    }
  });
}
