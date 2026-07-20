"use server";

import { redirect } from "next/navigation";
import { createRegistration } from "@/lib/registrations/service";
import { registrationSchema } from "@/lib/registrations/schema";

export async function submitRegistration(formData: FormData) {
  const gameIds = formData.getAll("gameIds").map(String);
  const parsed = registrationSchema.parse({
    fullName: formData.get("fullName"),
    publicName: formData.get("publicName"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    birthDate: formData.get("birthDate"),
    city: formData.get("city"),
    gameIds,
    consentTerms: formData.get("consentTerms") === "on",
    consentPrivacy: formData.get("consentPrivacy") === "on",
    consentImage: formData.get("consentImage") === "on"
  });
  const result = await createRegistration(parsed);
  redirect(`/pagamento/${result.token}`);
}
