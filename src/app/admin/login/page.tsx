import { Container, Field, Panel, inputClass } from "@/components/ui";
import { loginAction } from "./actions";

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  void searchParams;
  return (
    <Container className="grid min-h-screen content-center">
      <Panel className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-3xl font-black">Entrar</h1>
        <p className="mb-5 text-sm text-[#A3A3A3]">Acesso somente para administradores da Noite Gamer.</p>
        <form action={loginAction} className="grid gap-4">
          <Field label="E-mail"><input className={inputClass} name="email" type="email" required /></Field>
          <Field label="Senha"><input className={inputClass} name="password" type="password" required /></Field>
          <button className="min-h-12 bg-[#FFD400] font-black uppercase text-black">Entrar</button>
        </form>
      </Panel>
    </Container>
  );
}
