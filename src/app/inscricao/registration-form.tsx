"use client";

import { useActionState } from "react";
import { Field, inputClass } from "@/components/ui";
import { submitRegistration, type RegistrationFormState } from "./actions";

type GameOption = {
  id: string;
  name: string;
  price: number;
};

const initialState: RegistrationFormState = {};

export function RegistrationForm({ disabled, games }: { disabled: boolean; games: GameOption[] }) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState);
  const selectedGames = new Set(state.values?.gameIds ?? []);

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Nome/apelido na chave">
        <input className={inputClass} name="publicName" required maxLength={40} defaultValue={state.values?.publicName} />
      </Field>
      <Field label="WhatsApp">
        <input className={inputClass} name="whatsapp" required inputMode="tel" placeholder="(54) 99999-9999" defaultValue={state.values?.whatsapp} />
      </Field>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-bold">Modalidades</legend>
        {games.map((game) => (
          <label key={game.id} className="flex min-h-12 items-center justify-between border border-[#FFD400]/30 bg-black/30 px-3">
            <span>{game.name}</span>
            <span className="flex items-center gap-3 text-[#FFD400]">
              R$ {game.price.toFixed(2)}
              <input className="size-5" name="gameIds" type="checkbox" value={game.id} defaultChecked={selectedGames.has(game.id)} />
            </span>
          </label>
        ))}
      </fieldset>
      <Field label="Cupom de desconto">
        <input className={inputClass} name="couponCode" placeholder="EX: RELAMPAGO10" defaultValue={state.values?.couponCode} />
      </Field>
      {state.error ? (
        <p className="border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm font-bold text-red-100" role="alert" aria-live="polite">
          {state.error}
        </p>
      ) : null}
      <label className="flex gap-3 text-sm">
        <input required name="consentTerms" type="checkbox" /> Aceito o regulamento.
      </label>
      <label className="flex gap-3 text-sm">
        <input required name="consentPrivacy" type="checkbox" /> Aceito a politica de privacidade.
      </label>
      <label className="flex gap-3 text-sm">
        <input name="consentImage" type="checkbox" defaultChecked={state.values?.consentImage} /> Autorizo uso de imagem.
      </label>
      <button className="focus-ring min-h-12 bg-[#FFD400] px-5 font-black uppercase text-black disabled:opacity-50" disabled={disabled || pending} type="submit">
        {pending ? "Gerando Pix..." : "Gerar Pix"}
      </button>
    </form>
  );
}
