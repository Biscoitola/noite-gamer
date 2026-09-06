import { Container, Panel } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RafflesPage() {
  const prizes = await prisma.prize.findMany({
    where: { isActive: true, event: { status: "ACTIVE" } },
    include: {
      sponsor: true,
      winnerRegistration: { include: { participant: true } }
    },
    orderBy: [{ drawnAt: "desc" }, { createdAt: "desc" }]
  }).catch(() => []);
  const tournamentWinnerPrizes = prizes.filter((prize) => prize.raffleAudience === "TOURNAMENT_WINNERS");
  const participantPrizes = prizes.filter((prize) => prize.raffleAudience !== "TOURNAMENT_WINNERS");

  return (
    <div className="page-shell min-h-screen">
      <PublicHeader />
      <Container className="grid max-w-6xl gap-6">
        <header className="page-hero">
          <p className="page-eyebrow">Tickets, brindes e torcida</p>
          <h1 className="page-title">Sorteios <strong>liberados</strong></h1>
          <p className="page-lede">
            Tem sorteio para quem levou torneio e tambem para a galera confirmada na edicao ativa.
          </p>
        </header>
        <RaffleSection
          emptyText="Nenhum premio exclusivo de campeoes publicado no momento."
          prizes={tournamentWinnerPrizes}
          title="Sorteio entre campeoes"
        />
        <RaffleSection
          emptyText="Nenhum brinde geral publicado no momento."
          prizes={participantPrizes}
          title="Sorteio entre participantes"
        />
      </Container>
    </div>
  );
}

type RafflePrize = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  raffleAudience: string;
  sponsor: { name: string };
  winnerRegistration: { participant: { publicName: string }; raffleCode: string | null; protocol: string } | null;
};

function RaffleSection({ emptyText, prizes, title }: { emptyText: string; prizes: RafflePrize[]; title: string }) {
  return (
    <section className="grid gap-4">
      <div>
        <p className="text-sm font-black uppercase text-[#B45CFF]">{prizes.length} premio{prizes.length === 1 ? "" : "s"}</p>
        <h2 className="text-2xl font-black text-glow">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prizes.map((prize) => (
          <Panel className="interactive-panel grid gap-3" key={prize.id}>
            <img src={prize.imageUrl} alt={prize.title} className="h-56 w-full rounded-[6px] border border-[#B45CFF]/25 object-cover" />
            <div>
              <p className="text-xs font-black uppercase text-[#B45CFF]">{prize.sponsor.name}</p>
              <h3 className="text-xl font-black text-[#A855F7]">{prize.title}</h3>
              <p className="mt-1 text-sm text-[#A3A3A3]">{prize.description}</p>
              <p className="mt-2 text-xs font-black uppercase text-[#A855F7]">{raffleAudienceLabel(prize.raffleAudience)}</p>
            </div>
            {prize.winnerRegistration ? (
              <div className="neon-tile border-emerald-400/35 bg-emerald-400/10 p-3">
                <p className="text-xs font-black uppercase text-emerald-200">Ganhador</p>
                <strong className="text-lg">{prize.winnerRegistration.participant.publicName}</strong>
                <p className="text-sm text-[#D4D4D4]">Ticket {prize.winnerRegistration.raffleCode ?? prize.winnerRegistration.protocol}</p>
              </div>
            ) : (
              <div className="status-pill">
                Aguardando sorteio
              </div>
            )}
          </Panel>
        ))}
        {prizes.length === 0 ? <Panel><p>{emptyText}</p></Panel> : null}
      </div>
    </section>
  );
}

function raffleAudienceLabel(value: string) {
  return value === "TOURNAMENT_WINNERS" ? "Sorteio exclusivo para campeoes" : "Sorteio geral";
}
