import { z } from "zod";

export const registrationSchema = z.object({
  publicName: z.string().min(2).max(40),
  whatsapp: z.string().min(10),
  gameIds: z.array(z.string()).min(1),
  doubles: z.record(z.string(), z.object({
    teamName: z.string().trim().max(60).optional().or(z.literal("")),
    teammateName: z.string().trim().max(40).optional().or(z.literal("")),
    teammateWhatsapp: z.string().trim().max(30).optional().or(z.literal(""))
  })).optional().default({}),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  consentTerms: z.literal(true),
  consentPrivacy: z.literal(true),
  consentImage: z.boolean().optional().default(false)
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
