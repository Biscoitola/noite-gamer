import { prisma } from "@/lib/db";
import { confirmPayment } from "@/lib/registrations/service";
import { sanitizePayload } from "@/lib/security";

export type OfxTransaction = {
  fitId: string;
  amount: number;
  postedAt?: string;
  name: string;
  memo: string;
};

export type OfxImportResult = {
  imported: number;
  duplicates: number;
  confirmed: number;
  unmatched: Array<{ fitId: string; amount: number; description: string; reason: string }>;
};

export function parseOfxTransactions(ofxText: string): OfxTransaction[] {
  const blocks = [...ofxText.matchAll(/<STMTTRN>([\s\S]*?)(?=<STMTTRN>|<\/BANKTRANLIST>)/gi)].map((match) => match[1]);
  return blocks
    .map((block) => {
      const amount = Number(readOfxTag(block, "TRNAMT")?.replace(",", ".") ?? "NaN");
      const fitId = readOfxTag(block, "FITID") || `${readOfxTag(block, "DTPOSTED")}-${readOfxTag(block, "TRNAMT")}-${readOfxTag(block, "NAME")}`;
      return {
        fitId: normalizeFitId(fitId),
        amount,
        postedAt: readOfxTag(block, "DTPOSTED") ?? undefined,
        name: readOfxTag(block, "NAME") ?? "",
        memo: readOfxTag(block, "MEMO") ?? ""
      };
    })
    .filter((transaction) => transaction.fitId && Number.isFinite(transaction.amount) && transaction.amount > 0);
}

export async function reconcileOfx(ofxText: string): Promise<OfxImportResult> {
  const transactions = parseOfxTransactions(ofxText);
  const result: OfxImportResult = { imported: 0, duplicates: 0, confirmed: 0, unmatched: [] };

  for (const transaction of transactions) {
    const externalEventId = `ofx:${transaction.fitId}`;
    const existing = await prisma.paymentWebhook.findUnique({
      where: { provider_externalEventId: { provider: "ofx", externalEventId } }
    });
    if (existing) {
      result.duplicates += 1;
      continue;
    }

    result.imported += 1;
    const match = await findMatchingPayment(transaction);
    const webhook = await prisma.paymentWebhook.create({
      data: {
        provider: "ofx",
        externalEventId,
        paymentId: match?.id,
        type: match ? "ofx.matched" : "ofx.unmatched",
        payloadSanitized: sanitizePayload(transaction) as object,
        processed: Boolean(match),
        processedAt: match ? new Date() : null,
        error: match ? null : "Nenhuma inscricao pendente bateu valor e nome."
      }
    });

    if (!match) {
      result.unmatched.push({
        fitId: transaction.fitId,
        amount: transaction.amount,
        description: transactionDescription(transaction),
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

async function findMatchingPayment(transaction: OfxTransaction) {
  const candidates = await prisma.payment.findMany({
    where: {
      status: "PENDENTE",
      amount: transaction.amount,
      registration: { status: "AGUARDANDO_PAGAMENTO" }
    },
    include: { registration: { include: { participant: true } } },
    orderBy: { createdAt: "asc" }
  });
  const description = normalizeText(transactionDescription(transaction));
  return candidates.find((payment) => {
    const participant = payment.registration.participant;
    const fullName = normalizeText(participant.fullName);
    const publicName = normalizeText(participant.publicName);
    return includesAllWords(description, fullName) || includesAllWords(description, publicName);
  });
}

function readOfxTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"));
  return match?.[1]?.trim();
}

function normalizeFitId(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 180);
}

function transactionDescription(transaction: OfxTransaction) {
  return `${transaction.name} ${transaction.memo}`.trim();
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
