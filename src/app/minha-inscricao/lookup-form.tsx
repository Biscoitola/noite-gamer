"use client";

import { useActionState } from "react";
import { Field, Panel, inputClass } from "@/components/ui";
import { lookupRegistration, type RegistrationLookupState } from "./actions";

const initialState: RegistrationLookupState = {};

export function RegistrationLookupForm() {
  const [state, formAction, pending] = useActionState(lookupRegistration, initialState);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Panel>
        <h2 className="text-2xl font-black text-[#A855F7]">Consultar inscricao</h2>
        <p className="mt-2 text-sm text-[#D4D4D4]">
          Use o mesmo WhatsApp informado na inscricao para ver seus dados.
        </p>
        <form action={formAction} className="mt-5 grid gap-4">
          <Field label="WhatsApp">
            <input className={inputClass} name="whatsapp" inputMode="tel" placeholder="(54) 99999-9999" required />
          </Field>
          <button
            className="focus-ring neon-action min-h-12 px-5 font-black uppercase disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Buscando..." : "Ver minha inscricao"}
          </button>
        </form>
        {state.error ? <p className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{state.error}</p> : null}
      </Panel>

      <Panel>
        {state.registrations && state.registrations.length > 0 ? (
          <div className="grid gap-4">
            {state.registrations.map((registration) => (
              <article className="neon-tile grid gap-4" key={registration.protocol}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold uppercase text-[#A3A3A3]">Protocolo</p>
                    <strong className="text-2xl text-[#A855F7]">{registration.protocol}</strong>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-[#A3A3A3]">Ticket para sorteios</p>
                    <strong className="text-2xl text-[#00FF88]">{registration.raffleCode}</strong>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Nick na chave" value={registration.publicName} />
                  <Info label="Inscricao" value={registration.status} />
                  <Info label="Pagamento" value={registration.paymentStatus} />
                  <Info label="Valor" value={`R$ ${registration.totalAmount}`} />
                  {registration.couponCode ? (
                    <Info label="Cupom" value={`${registration.couponCode} (-R$ ${registration.couponDiscount})`} />
                  ) : null}
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-black text-[#A855F7]">Jogos inscritos</h3>
                  <ul className="grid gap-2">
                    {registration.games.map((game) => (
                      <li key={game.name} className="neon-tile grid gap-1 px-3 py-2 sm:grid-cols-[1fr_auto]">
                        <span className="font-bold">
                          {game.name}
                          {game.teamMode === "DOUBLES" ? (
                            <small className="mt-1 block text-xs font-black uppercase text-[#B45CFF]">
                              Dupla: {game.teamName ?? game.teammateName ?? "informada"}
                              {game.teammateName ? ` | Parceiro: ${game.teammateName}` : ""}
                            </small>
                          ) : null}
                        </span>
                        <span className="text-right text-sm text-[#D4D4D4]">{game.status} | R$ {game.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 content-center">
            <p className="text-lg font-black text-[#F5F5F5]">Sua inscricao aparece aqui.</p>
            <p className="mt-2 text-sm text-[#A3A3A3]">
              Esta consulta nao mostra lista publica. Ela so libera os dados quando o WhatsApp confere.
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="neon-tile p-3">
      <p className="text-xs font-black uppercase text-[#A3A3A3]">{label}</p>
      <p className="mt-1 font-bold text-[#F5F5F5]">{value}</p>
    </div>
  );
}
