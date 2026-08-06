import { Container, Field, Panel, inputClass } from "@/components/ui";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createAdminUserAction,
  toggleAdminUserActiveAction,
  updateAdminUserPasswordAction,
  updateAdminUserRoleAction
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminRole("ADMIN");
  const params = await searchParams;
  const successMessage = readSearchParam(params?.success);
  const errorMessage = readSearchParam(params?.error);
  const users = await prisma.adminUser.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] });

  return (
    <Container className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">Acesso administrativo</p>
        <h1 className="text-3xl font-black text-glow">Usuarios</h1>
      </div>

      {successMessage ? <Notice tone="success">{successMessage}</Notice> : null}
      {errorMessage ? <Notice tone="error">{errorMessage}</Notice> : null}

      <Panel className="interactive-panel">
        <h2 className="text-xl font-black text-[#FFD400]">Adicionar usuario</h2>
        <form action={createAdminUserAction} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome"><input className={inputClass} name="name" required /></Field>
            <Field label="E-mail"><input className={inputClass} name="email" required type="email" /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Senha temporaria"><input className={inputClass} name="password" minLength={8} required type="password" /></Field>
            <Field label="Permissao">
              <select className={inputClass} name="role" defaultValue="STAFF">
                <option value="STAFF">STAFF - Torneios e resultados</option>
                <option value="ADMIN">ADMIN - Acesso completo</option>
              </select>
            </Field>
          </div>
          <button className="focus-ring min-h-12 bg-[#FFD400] px-4 font-black uppercase text-black shadow-[0_0_22px_rgba(255,212,0,0.25)]">
            Criar usuario
          </button>
        </form>
      </Panel>

      <section className="grid gap-3">
        {users.map((user) => (
          <Panel className="grid gap-4" key={user.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#FFD400]">{user.name}</h2>
                <p className="text-sm text-[#A3A3A3]">{user.email}</p>
                <p className="mt-1 text-xs font-black uppercase text-[#B45CFF]">
                  {user.role} | {user.isActive ? "ativo" : "desativado"} | ultimo acesso {user.lastLoginAt ? user.lastLoginAt.toLocaleString("pt-BR") : "nunca"}
                </p>
              </div>
              <span className={user.isActive ? "text-sm font-black text-emerald-300" : "text-sm font-black text-red-200"}>
                {user.isActive ? "ATIVO" : "INATIVO"}
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <form action={updateAdminUserRoleAction} className="grid gap-2 border border-[#B45CFF]/25 bg-black/25 p-3">
                <input name="userId" type="hidden" value={user.id} />
                <Field label="Permissao">
                  <select className={inputClass} name="role" defaultValue={user.role}>
                    <option value="STAFF">STAFF - Torneios e resultados</option>
                    <option value="ADMIN">ADMIN - Acesso completo</option>
                  </select>
                </Field>
                <button className="focus-ring min-h-10 border border-[#FFD400]/60 px-3 text-xs font-black uppercase text-[#FFD400]">
                  Salvar permissao
                </button>
              </form>

              <form action={updateAdminUserPasswordAction} className="grid gap-2 border border-[#B45CFF]/25 bg-black/25 p-3">
                <input name="userId" type="hidden" value={user.id} />
                <Field label="Nova senha"><input className={inputClass} name="password" minLength={8} required type="password" /></Field>
                <button className="focus-ring min-h-10 border border-[#FFD400]/60 px-3 text-xs font-black uppercase text-[#FFD400]">
                  Trocar senha
                </button>
              </form>

              <form action={toggleAdminUserActiveAction} className="grid content-end gap-2 border border-[#B45CFF]/25 bg-black/25 p-3">
                <input name="userId" type="hidden" value={user.id} />
                <input name="isActive" type="hidden" value={user.isActive ? "false" : "true"} />
                <button className="focus-ring min-h-10 border border-red-500/50 px-3 text-xs font-black uppercase text-red-200 hover:bg-red-500/10">
                  {user.isActive ? "Desativar usuario" : "Ativar usuario"}
                </button>
              </form>
            </div>
          </Panel>
        ))}
      </section>
    </Container>
  );
}

function Notice({ children, tone }: { children: React.ReactNode; tone: "success" | "error" }) {
  return (
    <div className={tone === "success" ? "border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100" : "border border-red-400/45 bg-red-500/10 p-3 text-sm font-black text-red-100"}>
      {children}
    </div>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
