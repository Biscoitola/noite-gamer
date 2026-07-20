import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16).default("dev-secret-change-me-please"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  PAYMENT_PROVIDER: z.enum(["fake", "mercadopago", "manualpix"]).default("fake"),
  PAYMENT_ACCESS_TOKEN: z.string().optional().default(""),
  PAYMENT_WEBHOOK_SECRET: z.string().min(1).default("dev-webhook-secret"),
  PIX_KEY: z.string().optional().default(""),
  PIX_RECEIVER_NAME: z.string().optional().default("NOITE GAMER"),
  PIX_RECEIVER_CITY: z.string().optional().default("TAPEJARA"),
  EMAIL_PROVIDER: z.enum(["fake", "smtp"]).default("fake"),
  EMAIL_FROM: z.string().optional().default("Noite Gamer <no-reply@noitegamer.local>"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.string().optional().default(""),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  CRON_SECRET: z.string().min(1).default("dev-cron-secret"),
  SENTRY_DSN: z.string().optional().default(""),
  ADMIN_SEED_EMAIL: z.string().email().default("admin@noitegamer.local"),
  ADMIN_SEED_PASSWORD: z.string().min(10).default("troque-esta-senha-dev")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/noite_gamer?schema=public",
  AUTH_SECRET: process.env.AUTH_SECRET,
  APP_URL: process.env.APP_URL,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
  PAYMENT_ACCESS_TOKEN: process.env.PAYMENT_ACCESS_TOKEN,
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
  PIX_KEY: process.env.PIX_KEY,
  PIX_RECEIVER_NAME: process.env.PIX_RECEIVER_NAME,
  PIX_RECEIVER_CITY: process.env.PIX_RECEIVER_CITY,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  CRON_SECRET: process.env.CRON_SECRET,
  SENTRY_DSN: process.env.SENTRY_DSN,
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL,
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD
});
