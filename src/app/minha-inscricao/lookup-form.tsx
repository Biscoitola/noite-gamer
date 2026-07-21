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
        <h2 className="text-2xl font-black text-[#FFD400]">Consultar inscricao</h2>
        <p className="mt-2 text-sm text-[#D4D4D4]">
          Use o protocolo recebido no cadastro e o mesmo WhatsApp informado na inscricao.
        </p>
        <form action={formAction} className="mt-5 grid gap-4">
          <Field label="Protocolo">
            <input className={inputClass} name="protocol" placeholder="NG-20260720-ABC123" required />
          </Field>
          <Field label="WhatsApp">
            <input className={inputClass} name="whatsapp" inputMode="tel" placeholder="(54) 99999-9999" required />
          </Field>
          <button
            className="focus-ring min-h-12 bg-[#FFD400] px-5 font-black uppercase text-black disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Buscando..." : "Ver minha inscricao"}
          </button>
        </form>
        {state.error ? <p className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{state.error}</p> : null}
      </Panel>

      <Panel>
        {state.registration ? (
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-[#A3A3A3]">Protocolo</p>
              <strong className="text-2xl text-[#FFD400]">{state.registration.protocol}</strong>
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-[#A3A3A3]">Ticket para sorteios</p>
              <strong className="text-2xl text-[#FFD400]">{state.registration.raffleCode}</strong>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Nome" value={state.registration.fullName} />
              <Info label="Nick na chave" value={state.registration.publicName} />
              <Info label="Cidade" value={state.registration.city} />
              <Info label="Inscricao" value={state.registration.status} />
              <Info label="Pagamento" value={state.registration.paymentStatus} />
              <Info label="Valor" value={`R$ ${state.registration.totalAmount}`} />
            </div>
            <div>
              <h3 className="mb-3 text-lg font-black text-[#FFD400]">Jogos inscritos</h3>
              <ul className="grid gap-2">
                {state.registration.games.map((game) => (
                  <li key={game.name} className="flex items-center justify-between border border-[#B45CFF]/30 bg-black/30 px-3 py-2">
                    <span className="font-bold">{game.name}</span>
                    <span className="text-sm text-[#D4D4D4]">{game.status} | R$ {game.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid min-h-64 content-center">
            <p className="text-lg font-black text-[#F5F5F5]">Sua inscricao aparece aqui.</p>
            <p className="mt-2 text-sm text-[#A3A3A3]">
              Esta consulta nao mostra lista publica. Ela so libera os dados quando protocolo e WhatsApp conferem.
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#B45CFF]/25 bg-black/25 p-3">
      <p className="text-xs font-black uppercase text-[#A3A3A3]">{label}</p>
      <p className="mt-1 font-bold text-[#F5F5F5]">{value}</p>
    </div>
  );
}
