import { z } from "zod";

export const registrationSchema = z.object({
  publicName: z.string().min(2).max(40),
  whatsapp: z.string().min(10),
  gameIds: z.array(z.string()).min(1),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  consentTerms: z.literal(true),
  consentPrivacy: z.literal(true),
  consentImage: z.boolean().optional().default(false)
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
