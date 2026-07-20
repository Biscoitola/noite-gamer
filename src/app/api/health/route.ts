import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: "ok", version: process.env.npm_package_version ?? "0.1.0", time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, database: "error", time: new Date().toISOString() }, { status: 503 });
  }
}
