import Link from "next/link";
import { clsx } from "clsx";

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={clsx("mx-auto w-full max-w-6xl px-4 py-6 sm:px-6", className)}>{children}</main>;
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" }) {
  return (
    <Link
      href={href}
      className={clsx(
        "focus-ring inline-flex min-h-12 items-center justify-center border px-5 py-3 text-sm font-bold uppercase tracking-wide transition",
        variant === "primary"
          ? "border-[#FFE45C] bg-[#FFD400] text-black shadow-[0_0_24px_rgba(255,212,0,0.25)] hover:bg-[#FFE45C]"
          : "border-[#B45CFF] text-[#F5F5F5] shadow-[0_0_20px_rgba(180,92,255,0.2)] hover:border-[#FFE45C] hover:text-[#FFE45C]"
      )}
    >
      {children}
    </Link>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("border border-[#B45CFF]/35 bg-[#111111]/90 p-4 shadow-[0_0_24px_rgba(180,92,255,0.12)]", className)}>{children}</section>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#F5F5F5]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "focus-ring min-h-12 w-full border border-[#B45CFF]/35 bg-[#080808] px-3 py-2 text-base text-[#F5F5F5] placeholder:text-[#A3A3A3]";
