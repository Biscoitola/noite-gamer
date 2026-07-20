import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().min(3),
  publicName: z.string().min(2).max(40),
  whatsapp: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  birthDate: z.string().optional(),
  city: z.string().min(2),
  gameIds: z.array(z.string()).min(1),
  consentTerms: z.literal(true),
  consentPrivacy: z.literal(true),
  consentImage: z.boolean().optional().default(false)
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
