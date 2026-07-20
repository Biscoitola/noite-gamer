"use client";

export function PrintButton() {
  return (
    <button
      className="no-print focus-ring min-h-12 border border-[#F2B705] bg-[#F2B705] px-4 font-black uppercase text-black"
      type="button"
      onClick={() => window.print()}
    >
      Imprimir relatorio
    </button>
  );
}
