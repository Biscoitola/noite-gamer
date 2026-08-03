"use server";

import { redirect } from "next/navigation";
import { createRegistration } from "@/lib/registrations/service";
import { registrationSchema } from "@/lib/registrations/schema";

export type RegistrationFormState = {
  error?: string;
  values?: RegistrationFormValues;
};

type RegistrationFormValues = {
  publicName?: string;
  whatsapp?: string;
  couponCode?: string;
  gameIds: string[];
  consentImage?: boolean;
};

function getFormValues(formData: FormData): RegistrationFormValues {
  const gameIds = formData.getAll("gameIds").map(String);
  return {
    publicName: String(formData.get("publicName") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
    couponCode: String(formData.get("couponCode") || ""),
    gameIds,
    consentImage: formData.get("consentImage") === "on"
  };
}

function getRegistrationErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.toLowerCase().includes("cupom")) {
    return error.message;
  }

  return "Nao foi possivel gerar sua inscricao agora. Confira os dados e tente novamente.";
}

export async function submitRegistration(_previousState: RegistrationFormState, formData: FormData): Promise<RegistrationFormState> {
  const values = getFormValues(formData);
  const parsed = registrationSchema.safeParse({
    publicName: formData.get("publicName"),
    whatsapp: formData.get("whatsapp"),
    gameIds: values.gameIds,
    couponCode: formData.get("couponCode"),
    consentTerms: formData.get("consentTerms") === "on",
    consentPrivacy: formData.get("consentPrivacy") === "on",
    consentImage: formData.get("consentImage") === "on"
  });

  if (!parsed.success) {
    return { error: "Confira os dados da inscricao e aceite os termos obrigatorios.", values };
  }

  let token: string;
  try {
    const result = await createRegistration(parsed.data);
    token = result.token;
  } catch (error) {
    return { error: getRegistrationErrorMessage(error), values };
  }

  redirect(`/pagamento/${token}`);
}
