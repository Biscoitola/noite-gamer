import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { listActiveGames } from "@/lib/registrations/service";
import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

export default async function RegistrationPage() {
  const event = await listActiveGames().catch(() => null);
  const games = event?.games.map((game) => ({ id: game.id, name: game.name, price: Number(game.price) })) ?? [];
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
        <RegistrationForm disabled={!event} games={games} />
      </Panel>
      </Container>
    </>
  );
}
