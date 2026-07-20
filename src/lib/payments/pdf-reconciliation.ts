import crypto from "node:crypto";
import "server-only";
import { prisma } from "@/lib/db";
import { confirmPayment } from "@/lib/registrations/service";
import { sanitizePayload } from "@/lib/security";

export type PdfTransaction = {
  fitId: string;
  amount: number;
  description: string;
};

export type PdfImportResult = {
  imported: number;
  duplicates: number;
  confirmed: number;
  unmatched: Array<{ fitId: string; amount: number; description: string; reason: string }>;
};

export async function reconcilePdf(buffer: Buffer): Promise<PdfImportResult> {
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const parsed = await pdfParse(buffer);
  const transactions = parsePdfTransactions(parsed.text);
  const result: PdfImportResult = { imported: 0, duplicates: 0, confirmed: 0, unmatched: [] };

  for (const transaction of transactions) {
    const externalEventId = `pdf:${transaction.fitId}`;
    const existing = await prisma.paymentWebhook.findUnique({
      where: { provider_externalEventId: { provider: "pdf", externalEventId } }
    });
    if (existing) {
      result.duplicates += 1;
      continue;
    }

    result.imported += 1;
    const match = await findMatchingPayment(transaction);
    const webhook = await prisma.paymentWebhook.create({
      data: {
        provider: "pdf",
        externalEventId,
        paymentId: match?.id,
        type: match ? "pdf.matched" : "pdf.unmatched",
        payloadSanitized: sanitizePayload(transaction) as object,
        processed: Boolean(match),
        processedAt: match ? new Date() : null,
        error: match ? null : "Nenhuma inscricao pendente bateu valor e nome no PDF."
      }
    });

    if (!match) {
      result.unmatched.push({
        fitId: transaction.fitId,
        amount: transaction.amount,
        description: transaction.description,
        reason: "Sem match por valor e nome"
      });
      continue;
    }

    await confirmPayment(match.externalId);
    await prisma.paymentWebhook.update({
      where: { id: webhook.id },
      data: { processed: true, processedAt: new Date() }
    });
    result.confirmed += 1;
  }

  return result;
}

export function parsePdfTransactions(text: string): PdfTransaction[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const transactions = new Map<string, PdfTransaction>();
  for (let index = 0; index < lines.length; index += 1) {
    const windowText = [lines[index - 1], lines[index], lines[index + 1]].filter(Boolean).join(" ");
    const amount = extractReceivedAmount(windowText);
    if (!amount) continue;
    const normalized = normalizeText(windowText);
    if (!normalized.includes("pix")) continue;
    if (normalized.includes("agend")) continue;
    const fitId = hashTransaction(windowText, amount);
    transactions.set(fitId, { fitId, amount, description: windowText.slice(0, 500) });
  }
  return [...transactions.values()];
}

async function findMatchingPayment(transaction: PdfTransaction) {
  const candidates = await prisma.payment.findMany({
    where: {
      status: "PENDENTE",
      amount: transaction.amount,
      registration: { status: "AGUARDANDO_PAGAMENTO" }
    },
    include: { registration: { include: { participant: true } } },
    orderBy: { createdAt: "asc" }
  });
  const description = normalizeText(transaction.description);
  return candidates.find((payment) => {
    const participant = payment.registration.participant;
    const fullName = normalizeText(participant.fullName);
    const publicName = normalizeText(participant.publicName);
    return includesAllWords(description, fullName) || includesAllWords(description, publicName);
  });
}

function extractReceivedAmount(text: string) {
  const normalized = normalizeText(text);
  const looksLikeCredit = /(receb|entrada|credito|creditado|pix recebido)/.test(normalized) || !/(pagamento|enviado|debito|deb|saida)/.test(normalized);
  if (!looksLikeCredit) return null;
  const moneyMatches = [...text.matchAll(/(?:R\$\s*)?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2})/g)];
  if (moneyMatches.length === 0) return null;
  const values = moneyMatches
    .map((match) => Number(match[1].replace(/\./g, "").replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (values.length === 0) return null;
  return values.at(-1) ?? null;
}

function hashTransaction(description: string, amount: number) {
  return crypto.createHash("sha256").update(`${amount.toFixed(2)}:${normalizeText(description)}`).digest("hex");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function includesAllWords(haystack: string, needle: string) {
  const words = needle.split(" ").filter((word) => word.length >= 3);
  if (words.length === 0) return false;
  return words.every((word) => haystack.includes(word));
}
