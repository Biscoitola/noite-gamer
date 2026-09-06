"use client";

export function PrintButton() {
  return (
    <button
      className="no-print focus-ring neon-action min-h-12 px-4 font-black uppercase"
      type="button"
      onClick={() => window.print()}
    >
      Imprimir relatorio
    </button>
  );
}
