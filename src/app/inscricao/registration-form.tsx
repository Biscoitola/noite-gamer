"use client";

import { useActionState, useState } from "react";
import { Field, inputClass } from "@/components/ui";
import { submitRegistration, type RegistrationFormState } from "./actions";
import { calculateRegistrationTotal } from "@/lib/pricing";
import { formatBRL, type EditionCommerceSettings } from "@/lib/edition-settings";
import { isFifaAddon, isFifaBaseGame } from "@/lib/registrations/addon";

type GameOption = {
  id: string;
  name: string;
  price: number;
  capacity: number;
  teamMode: "SOLO" | "DOUBLES";
  remaining: number;
};

const initialState: RegistrationFormState = {};

export function RegistrationForm({ disabled, games, commerceSettings }: { disabled: boolean; games: GameOption[]; commerceSettings: EditionCommerceSettings }) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState);
  const [publicName, setPublicName] = useState(state.values?.publicName ?? "");
  const [selectedGameIds, setSelectedGameIds] = useState(() => new Set(state.values?.gameIds ?? []));
  const doublesGames = games.filter((game) => game.teamMode === "DOUBLES" && selectedGameIds.has(game.id));
  const selectedGames = games.filter((game) => game.remaining > 0 && selectedGameIds.has(game.id));
  const baseGames = games.filter((game) => !isFifaAddon(game));
  const fifa = games.find(isFifaAddon);
  const canAddFifa = selectedGames.some(isFifaBaseGame);
  const totals = calculateRegistrationTotal(selectedGames.map((game) => ({ gameId: game.id, price: isFifaAddon(game) ? 5 : game.price, isAddon: isFifaAddon(game) })), undefined, commerceSettings);

  function toggleGame(gameId: string, checked: boolean) {
    setSelectedGameIds((current) => {
      const next = new Set(current);
      if (checked) next.add(gameId);
      else next.delete(gameId);
      if (!games.some((game) => game.remaining > 0 && isFifaBaseGame(game) && next.has(game.id))) {
        games.filter(isFifaAddon).forEach((game) => next.delete(game.id));
      }
      return next;
    });
  }

  return (
    <form action={formAction} className="grid gap-5">
      <Field label="Seu nome/apelido">
        <input
          className={inputClass}
          name="publicName"
          required
          maxLength={40}
          value={publicName}
          onChange={(event) => setPublicName(event.currentTarget.value)}
        />
      </Field>
      <Field label="WhatsApp">
        <input className={inputClass} name="whatsapp" required inputMode="tel" placeholder="(54) 99999-9999" defaultValue={state.values?.whatsapp} />
      </Field>
      <fieldset className="grid gap-3">
        <legend className="page-eyebrow mb-1">Modalidades</legend>
        {baseGames.map((game) => (
          <div key={game.id} className="neon-tile grid gap-3">
            <label className="flex min-h-12 items-center justify-between gap-3">
              <span className="grid gap-1">
                <span className="text-lg font-black text-[#F5F5F5]">{game.name}</span>
                <span className="text-xs font-black uppercase text-[#B45CFF]">
                  {game.teamMode === "DOUBLES" ? "Inscricao em dupla" : "Inscricao individual"}
                </span>
                <span className={game.remaining > 0 ? "text-xs font-black uppercase text-[#A3A3A3]" : "text-xs font-black uppercase text-red-200"}>
                  {game.remaining > 0 ? `${game.remaining} de ${game.capacity} vagas disponiveis` : "Esgotado"}
                </span>
              </span>
              <span className="flex items-center gap-3 text-[#00FF88]">
                {formatBRL(game.price)}
                <input
                  className="size-5 accent-[#00FF88]"
                  disabled={game.remaining <= 0}
                  name="gameIds"
                  onChange={(event) => toggleGame(game.id, event.currentTarget.checked)}
                  type="checkbox"
                  value={game.id}
                  checked={game.remaining > 0 && selectedGameIds.has(game.id)}
                />
              </span>
            </label>
          </div>
        ))}
      </fieldset>
      {fifa ? (
        <fieldset className="neon-tile grid gap-3 border border-[#00FF88]/40">
          <legend className="page-eyebrow px-2">Mais uma disputa por apenas R$ 5</legend>
          <p className="font-bold">Vai jogar Mortal Kombat ou Rocket League? Leve o FIFA 26 junto!</p>
          <p className="text-sm text-[#A3A3A3]">Escolha um jogo por R$ 15 ou aproveite o combo. Depois, adicione o FIFA 26 por mais R$ 5 na mesma inscrição.</p>
          <label className="flex min-h-12 items-center justify-between gap-3 font-black text-[#00FF88]">
            <span>Quero jogar FIFA 26 também · + {formatBRL(5)}</span>
            <input className="size-5 accent-[#00FF88]" type="checkbox" name="gameIds" value={fifa.id}
              disabled={!canAddFifa || fifa.remaining <= 0}
              checked={canAddFifa && selectedGameIds.has(fifa.id)}
              onChange={(event) => toggleGame(fifa.id, event.currentTarget.checked)} />
          </label>
          <p className="text-xs text-[#A3A3A3]">{fifa.remaining <= 0 ? "Vagas de FIFA 26 esgotadas." : !canAddFifa ? "Selecione Mortal Kombat ou Rocket League para liberar o adicional." : `${fifa.remaining} vagas disponíveis para FIFA 26.`}</p>
          <p className="text-sm">Um jogo + FIFA 26: <strong>R$ 20,00</strong>{commerceSettings.comboEnabled ? <> · Combo + FIFA 26: <strong>{formatBRL(commerceSettings.comboPrice + 5)}</strong></> : null}</p>
        </fieldset>
      ) : null}
      <div className="neon-tile grid gap-2" aria-live="polite">
        {commerceSettings.comboEnabled && baseGames.length >= 2 ? <p className="font-bold text-[#00FF88]">Combo: {fifa ? "Mortal Kombat + Rocket League" : "dois jogos"} por {formatBRL(commerceSettings.comboPrice)} na mesma inscrição.</p> : null}
        {totals.multiGameDiscount > 0 ? <p className="text-sm">Desconto do combo: {formatBRL(totals.multiGameDiscount)}</p> : null}
        <p className="text-xl font-black">Total: {formatBRL(totals.total)}</p>
        <p className="text-xs text-[#A3A3A3]">Cupons válidos serão aplicados ao gerar o Pix.</p>
      </div>
      {doublesGames.length > 0 ? (
        <fieldset className="neon-card grid gap-3 border border-[#B45CFF]/35 p-3">
          <legend className="px-2 text-sm font-bold text-[#A855F7]">Dados das duplas</legend>
          {doublesGames.map((game) => {
            const doublesValue = state.values?.doubles?.[game.id];
            return (
              <div className="neon-tile grid gap-3" key={game.id}>
                <p className="text-sm font-black uppercase text-[#B45CFF]">{game.name}</p>
                <Field label="Nome da dupla">
                  <input
                    className={inputClass}
                    name={`teamName:${game.id}`}
                    required
                    placeholder="Ex: Os Controleiros"
                    defaultValue={doublesValue?.teamName}
                  />
                </Field>
                <Field label="Participante 1 da dupla">
                  <input
                    className={inputClass}
                    readOnly
                    value={publicName}
                    placeholder="Preencha seu nome acima"
                  />
                </Field>
                <Field label="Participante 2 da dupla">
                  <input
                    className={inputClass}
                    name={`teammateName:${game.id}`}
                    required
                    maxLength={40}
                    defaultValue={doublesValue?.teammateName}
                  />
                </Field>
                <Field label="WhatsApp do parceiro">
                  <input
                    className={inputClass}
                    name={`teammateWhatsapp:${game.id}`}
                    required
                    inputMode="tel"
                    placeholder="(54) 99999-9999"
                    defaultValue={doublesValue?.teammateWhatsapp}
                  />
                </Field>
              </div>
            );
          })}
        </fieldset>
      ) : null}
      <Field label="Cupom de desconto">
        <input className={inputClass} name="couponCode" placeholder="EX: RELAMPAGO10" defaultValue={state.values?.couponCode} />
      </Field>
      {state.error ? (
        <p className="border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm font-bold text-red-100" role="alert" aria-live="polite">
          {state.error}
        </p>
      ) : null}
      <label className="form-check text-sm">
        <input required name="consentTerms" type="checkbox" /> Aceito o regulamento.
      </label>
      <label className="form-check text-sm">
        <input required name="consentPrivacy" type="checkbox" /> Aceito a politica de privacidade.
      </label>
      <label className="form-check text-sm">
        <input name="consentImage" type="checkbox" defaultChecked={state.values?.consentImage} /> Autorizo uso de imagem.
      </label>
      <button className="focus-ring neon-action min-h-12 px-5 font-black uppercase disabled:opacity-50" disabled={disabled || pending} type="submit">
        {pending ? "Gerando Pix..." : "Gerar Pix"}
      </button>
    </form>
  );
}
