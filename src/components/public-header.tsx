"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackButton } from "./back-button";

const navLinks = [
  { href: "/", label: "Home", match: "exact" },
  { href: "/inscricao", label: "Inscricao" },
  { href: "/minha-inscricao", label: "Minha inscricao" },
  { href: "/torneios", label: "Torneios" },
  { href: "/patrocinadores", label: "Patrocinio" },
  { href: "/premios", label: "Premios" },
  { href: "/sorteios", label: "Sorteios" },
  { href: "/regulamento", label: "Regulamento" },
  { href: "/admin", label: "Entrar (somente admin)" }
];

export function EventLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="focus-ring grid w-fit grid-cols-[auto_1fr] items-center gap-3">
      <span className={compact ? "logo-core logo-core-compact" : "logo-core"} aria-hidden="true">
        NG
      </span>
      <span className="grid leading-none">
        <strong className={compact ? "text-base text-[#F5F5F5]" : "text-2xl text-[#F5F5F5] sm:text-3xl"}>NOITE GAMER</strong>
        <span className="text-xs font-black uppercase text-[#B45CFF]">HARP - Tapejara/RS</span>
      </span>
    </Link>
  );
}

export function PublicHeader({ showBack = true }: { showBack?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="public-nav-shell sticky top-0 z-40 px-3 py-3">
      <div className="public-nav-inner mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <EventLogo compact />
        <nav className="public-nav-links ml-auto flex flex-wrap items-center gap-2 text-xs font-black uppercase">
          {navLinks.map((link) => {
            const active = link.match === "exact" ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link className={active ? "public-nav-active" : undefined} href={link.href} key={link.href}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        {showBack ? <BackButton /> : null}
      </div>
    </header>
  );
}
