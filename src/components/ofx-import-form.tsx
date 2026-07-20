"use client";

import { useActionState } from "react";
import { importPdfAction } from "@/app/admin/pagamentos/actions";

type ImportState = {
  imported: number;
  duplicates: number;
  confirmed: number;
  unmatched: Array<{ fitId: string; amount: number; description: string; reason: string }>;
} | null;

export function OfxImportForm() {
  const [state, formAction, pending] = useActionState<ImportState, FormData>(async (_previous, formData) => {
    return importPdfAction(formData);
  }, null);

  return (
    <section className="grid gap-3">
      <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm font-black">
          Importar PDF do banco
          <input className="min-h-12 border border-[#B45CFF]/35 bg-black px-3 py-2" name="pdfFile" type="file" accept=".pdf,.PDF,application/pdf" required />
        </label>
        <button className="mt-7 min-h-12 bg-[#F2B705] px-4 font-black uppercase text-black disabled:opacity-50" disabled={pending}>
          {pending ? "Processando..." : "Conciliar PDF"}
        </button>
      </form>

      {state ? (
        <div className="grid gap-2 border border-[#B45CFF]/35 bg-black/25 p-3 text-sm">
          <p>Transacoes novas: <strong>{state.imported}</strong></p>
          <p>Ignoradas por duplicidade: <strong>{state.duplicates}</strong></p>
          <p>Inscricoes confirmadas: <strong className="text-[#F2B705]">{state.confirmed}</strong></p>
          {state.unmatched.length > 0 ? (
            <details>
              <summary className="cursor-pointer font-black text-[#B45CFF]">Ver transacoes sem match ({state.unmatched.length})</summary>
              <ul className="mt-2 grid gap-1">
                {state.unmatched.map((item) => (
                  <li key={item.fitId}>
                    {item.fitId} - R$ {item.amount.toFixed(2)} - {item.description || "sem descricao"} - {item.reason}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
