import Link from "next/link";
import { BackButton } from "./back-button";

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
  return (
    <header className="public-nav-shell sticky top-0 z-40 px-3 py-3">
      <div className="public-nav-inner mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <EventLogo compact />
        <nav className="public-nav-links ml-auto flex flex-wrap items-center gap-2 text-xs font-black uppercase">
          <Link href="/">Home</Link>
          <Link className="public-nav-cta" href="/inscricao">Inscricao</Link>
          <Link href="/minha-inscricao">Minha inscricao</Link>
          <Link href="/torneios">Torneios</Link>
          <Link href="/patrocinadores">Patrocinio</Link>
          <Link href="/sorteios">Sorteios</Link>
          <Link href="/regulamento">Regulamento</Link>
          <Link href="/admin">Entrar (somente admin)</Link>
        </nav>
        {showBack ? <BackButton /> : null}
      </div>
    </header>
  );
}
