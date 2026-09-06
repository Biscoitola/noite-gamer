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
        "focus-ring inline-flex min-h-12 items-center justify-center rounded-[8px] border px-5 py-3 text-sm font-black uppercase transition",
        variant === "primary"
          ? "border-[#00FF88] bg-[#00E676] text-[#020704] shadow-[0_0_24px_rgba(0,255,128,0.26)] hover:bg-[#22FF99]"
          : "border-[#00FF88]/60 bg-black/20 text-[#F5F5F5] shadow-[0_0_20px_rgba(0,255,128,0.12)] hover:border-[#00FF88] hover:text-[#00FF88]"
      )}
    >
      {children}
    </Link>
  );
}

export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={clsx("neon-card border border-[#B45CFF]/35 bg-[#0B0712]/90 p-4 shadow-[0_0_24px_rgba(180,92,255,0.12)]", className)} {...props}>{children}</section>;
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
  "focus-ring min-h-12 w-full rounded-[8px] border border-[#B45CFF]/35 bg-[#05030A]/90 px-3 py-2 text-base text-[#F5F5F5] shadow-[inset_0_0_18px_rgba(168,85,247,0.06)] placeholder:text-[#A3A3A3]";
