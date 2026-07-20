import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { env } from "./env";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string) {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(token).digest("hex");
}

export function createPublicToken() {
  return nanoid(48);
}

export function createProtocol(prefix = "NG") {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `${prefix}-${stamp}-${nanoid(8).toUpperCase()}`;
}

export function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

export function sanitizePayload(payload: unknown) {
  return JSON.parse(
    JSON.stringify(payload, (key, value) => {
      if (/token|secret|password|authorization|qrCodeText/i.test(key)) return "[redacted]";
      return value;
    })
  ) as unknown;
}
