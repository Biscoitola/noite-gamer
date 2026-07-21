import Link from "next/link";
import { logoutAction } from "./login/actions";

const adminLinks = [
  { href: "/admin", label: "Dashboard", code: "DB" },
  { href: "/admin/inscricoes", label: "Inscricoes", code: "IN" },
  { href: "/admin/pagamentos", label: "Pagamentos", code: "PX" },
  { href: "/admin/relatorios/inscritos", label: "Relatorios", code: "RP" },
  { href: "/admin/check-in", label: "Check-in", code: "CK" },
  { href: "/admin/torneios", label: "Torneios", code: "TR" },
  { href: "/admin/patrocinadores", label: "Patrocinadores", code: "PT" },
  { href: "/admin/configuracoes", label: "Configuracoes", code: "CF" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen">
      <aside className="admin-sidebar no-print">
        <Link className="admin-brand focus-ring" href="/admin">
          <span className="logo-core logo-core-compact" aria-hidden="true">NG</span>
          <span>
            <strong>Admin</strong>
            <small>Noite Gamer</small>
          </span>
        </Link>

        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <Link className="admin-nav-link focus-ring" href={link.href} key={link.href}>
              <span>{link.code}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link className="admin-public-link focus-ring" href="/">Home do site</Link>
          <form action={logoutAction}>
            <button className="admin-logout focus-ring" type="submit">Sair</button>
          </form>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar no-print">
          <div>
            <strong>Painel Administrativo</strong>
            <span>Gestao de inscricoes, pagamentos e torneios</span>
          </div>
          <Link className="admin-topbar-home focus-ring" href="/">Ver site</Link>
        </header>
        {children}
      </div>
    </div>
  );
}
