import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { remainingSlots } from "@/lib/capacity";
import { listActiveGames } from "@/lib/registrations/service";
import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

export default async function RegistrationPage() {
  const event = await listActiveGames().catch(() => null);
  const games = event?.games.map((game) => ({
    id: game.id,
    name: game.name,
    price: Number(game.price),
    capacity: game.capacity,
    teamMode: game.teamMode,
    remaining: remainingSlots(game.capacity, game._count.items)
  })) ?? [];
  return (
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-6xl gap-6">
      <header className="page-hero">
        <p className="page-eyebrow">Inscricao online</p>
        <h1 className="page-title">Escolha sua <strong>disputa</strong></h1>
        <p className="page-lede">
          Garanta sua vaga, informe seus dados e gere o Pix. Depois da confirmacao, seu nome entra no chaveamento e nos sorteios da edicao.
        </p>
      </header>
      {!event ? (
        <Panel>
          <h2 className="text-xl font-black text-[#A855F7]">Banco de dados indisponivel</h2>
          <p className="mt-2 text-[#D4D4D4]">
            A inscricao precisa do PostgreSQL ativo. Confirme o Docker, rode as migrations e reinicie o servidor de desenvolvimento.
          </p>
        </Panel>
      ) : null}
      <Panel>
        <RegistrationForm disabled={!event} games={games} />
      </Panel>
      </Container>
    </div>
  );
}
