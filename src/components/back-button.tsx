"use client";

export function BackButton({ label = "Voltar" }: { label?: string }) {
  return (
    <button
      className="focus-ring inline-flex min-h-10 items-center gap-2 border border-[#B45CFF]/60 bg-[#111111]/80 px-3 text-sm font-black uppercase text-[#F5F5F5] shadow-[0_0_18px_rgba(180,92,255,0.18)] transition hover:border-[#FFE45C] hover:text-[#FFE45C]"
      type="button"
      onClick={() => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = "/";
      }}
    >
      <span aria-hidden="true">{"<"}</span>
      {label}
    </button>
  );
}
