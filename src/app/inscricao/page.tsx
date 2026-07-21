import { Container, Field, Panel, inputClass } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { listActiveGames } from "@/lib/registrations/service";
import { submitRegistration } from "./actions";

export const dynamic = "force-dynamic";

export default async function RegistrationPage() {
  const event = await listActiveGames().catch(() => null);
  const games = event?.games ?? [];
  return (
    <>
      <PublicHeader />
      <Container className="grid gap-5">
      <h1 className="text-3xl font-black text-glow">Inscricao</h1>
      {!event ? (
        <Panel>
          <h2 className="text-xl font-black text-[#FFD400]">Banco de dados indisponivel</h2>
          <p className="mt-2 text-[#D4D4D4]">
            A inscricao precisa do PostgreSQL ativo. Confirme o Docker, rode as migrations e reinicie o servidor de desenvolvimento.
          </p>
        </Panel>
      ) : null}
      <Panel>
        <form action={submitRegistration} className="grid gap-4">
          <Field label="Nome completo"><input className={inputClass} name="fullName" required autoComplete="name" /></Field>
          <Field label="Nome/apelido na chave"><input className={inputClass} name="publicName" required maxLength={40} /></Field>
          <Field label="WhatsApp"><input className={inputClass} name="whatsapp" required inputMode="tel" placeholder="(54) 99999-9999" /></Field>
          <Field label="E-mail"><input className={inputClass} name="email" type="email" autoComplete="email" /></Field>
          <Field label="Data de nascimento"><input className={inputClass} name="birthDate" type="date" /></Field>
          <Field label="Cidade"><input className={inputClass} name="city" required autoComplete="address-level2" /></Field>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold">Modalidades</legend>
            {games.map((game) => (
              <label key={game.id} className="flex min-h-12 items-center justify-between border border-[#FFD400]/30 bg-black/30 px-3">
                <span>{game.name}</span>
                <span className="flex items-center gap-3 text-[#FFD400]">
                  R$ {Number(game.price).toFixed(2)}
                  <input className="size-5" name="gameIds" type="checkbox" value={game.id} />
                </span>
              </label>
            ))}
          </fieldset>
          <label className="flex gap-3 text-sm"><input required name="consentTerms" type="checkbox" /> Aceito o regulamento.</label>
          <label className="flex gap-3 text-sm"><input required name="consentPrivacy" type="checkbox" /> Aceito a politica de privacidade.</label>
          <label className="flex gap-3 text-sm"><input name="consentImage" type="checkbox" /> Autorizo uso de imagem.</label>
          <button className="focus-ring min-h-12 bg-[#FFD400] px-5 font-black uppercase text-black disabled:opacity-50" disabled={!event} type="submit">Gerar Pix</button>
        </form>
      </Panel>
      </Container>
    </>
  );
}
