import { Field, inputClass } from "@/components/ui";
import { readEditionCommerceSettings } from "@/lib/edition-settings";

export function EditionCommerceFields({ settings }: { settings?: unknown }) {
  const config = readEditionCommerceSettings(settings);
  return (
    <fieldset className="grid gap-3 border border-[#B45CFF]/25 p-3">
      <legend className="px-2 font-bold text-[#A855F7]">Combo e premiação acumulada</legend>
      <label className="form-check text-sm">
        <input name="comboEnabled" type="checkbox" defaultChecked={settings === undefined || config.comboEnabled} />
        Ativar combo para dois jogos na mesma inscrição
      </label>
      <Field label="Valor total do combo (R$)">
        <input className={inputClass} name="comboPrice" type="number" min="0" max="999999.99" step="0.01" required defaultValue={config.comboPrice} />
      </Field>
      <p className="text-xs text-[#A3A3A3]">O preço individual é definido em cada jogo. O combo se aplica à seleção de exatamente dois jogos; cupons são descontados depois.</p>
      <label className="form-check text-sm">
        <input name="showPrizePool" type="checkbox" defaultChecked={config.showPrizePool} />
        Mostrar prêmio acumulado no site
      </label>
      <Field label="Percentual da arrecadação destinado ao prêmio (%)">
        <input className={inputClass} name="prizePoolPercent" type="number" min="0" max="100" step="0.01" required defaultValue={config.prizePoolPercent} />
      </Field>
      <p className="text-xs text-[#A3A3A3]">Com 90%, a premiação recebe 90% dos pagamentos confirmados da edição e a organização fica com 10%. Pagamentos pendentes e reembolsados não entram no acumulado.</p>
    </fieldset>
  );
}
