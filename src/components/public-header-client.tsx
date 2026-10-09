"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BackButton } from "./back-button";
import { EventLogo } from "./event-logo";

const navLinks = [
  { href: "/", label: "Home", match: "exact" },
  { href: "/inscricao", label: "Inscricao" },
  { href: "/minha-inscricao", label: "Minha inscricao" },
  { href: "/torneios", label: "Torneios" },
  { href: "/patrocinadores", label: "Patrocinio" },
  { href: "/premios", label: "Premios" },
  { href: "/sorteios", label: "Sorteios" },
  { href: "/regulamento", label: "Regulamento" }
];

export function PublicHeaderClient({ showAdminLink, showBack = true }: { showAdminLink: boolean; showBack?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = showAdminLink ? [...navLinks, { href: "/admin", label: "Admin" }] : navLinks;

  return (
    <header className="public-nav-shell sticky top-0 z-40 px-3 py-4">
      <div className="public-nav-inner mx-auto flex max-w-7xl items-center gap-4">
        <EventLogo compact />
        <Link className="mobile-keys-link focus-ring" href="/torneios">Ver chaves</Link>
        <button className="mobile-menu-button focus-ring" type="button" aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "Fechar menu" : "Menu"}
        </button>
        <nav id="public-navigation" aria-label="Navegação principal" className={`public-nav-links ml-auto flex items-center gap-1 text-xs font-black uppercase ${menuOpen ? "public-nav-open" : ""}`}>
          {links.map((link) => {
            const active = link.match === "exact" ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link className={active ? "public-nav-active" : undefined} aria-current={active ? "page" : undefined} href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <span className="public-account-icon" aria-hidden="true" />
        {showBack ? <BackButton /> : null}
      </div>
    </header>
  );
}
