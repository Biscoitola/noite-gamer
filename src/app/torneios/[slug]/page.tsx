import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/auto-refresh";
import { Container } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PublicMatch = {
  id: string;
  position: number;
  status: string;
  participant1: string;
  participant2: string;
  winner: string | null;
};

type PublicRound = {
  id: string;
  name: string;
  order: number;
  matches: PublicMatch[];
};

type SideMatch = PublicMatch & {
  top: number;
};

type SideRound = Omit<PublicRound, "matches"> & {
  matches: SideMatch[];
};

export default async function TournamentSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tournament = await prisma.tournament.findFirst({
    where: {
      public: true,
      status: { not: "DRAFT" },
      game: { slug, event: { status: "ACTIVE" } },
      matches: { some: {} }
    },
    include: {
      game: { include: { event: true } },
      rounds: {
        orderBy: { order: "asc" },
        include: {
          matches: {
            orderBy: { position: "asc" },
            include: {
              participant1: { include: { participant: true } },
              participant2: { include: { participant: true } },
              winner: { include: { participant: true } }
            }
          }
        }
      }
    }
  });
  if (!tournament) notFound();

  const rounds: PublicRound[] = tournament.rounds.map((round) => ({
    id: round.id,
    name: formatRoundName(round.name),
    order: round.order,
    matches: round.matches.map((match) => ({
      id: match.id,
      position: match.position,
      status: match.status,
      participant1: entryName(match.participant1),
      participant2: entryName(match.participant2),
      winner: match.winner ? entryName(match.winner) : null
    }))
  }));
  const finalRound = rounds.at(-1);
  const sideRounds = rounds.slice(0, -1);
  const leftRounds = buildSideRounds(sideRounds, "left");
  const rightRounds = buildSideRounds(sideRounds, "right");
  const champion = tournament.championEntryId
    ? finalRound?.matches.find((match) => match.winner)?.winner
    : finalRound?.matches.find((match) => match.winner)?.winner;

  return (
    <div className="page-shell min-h-screen">
      <AutoRefresh />
      <PublicHeader />
      <Container className="grid max-w-none gap-3 px-2 py-3 sm:px-4">
        <header className="page-hero mx-auto grid w-full max-w-6xl gap-1 text-center">
          <p className="page-eyebrow">
            Nexus Arena - {tournament.game.event.edition}
          </p>
          <h1 className="page-title">{tournament.game.name}</h1>
          <p className="page-lede mx-auto">Chaveamento mata-mata atualizado automaticamente durante o evento.</p>
        </header>

        <div className="world-bracket-viewport pb-4">
          <div className="world-bracket scratched mx-auto">
            <BracketSide rounds={leftRounds} side="left" />

            <section className="world-center">
              <div className="world-final">
                <h2>Final</h2>
                {finalRound?.matches.map((match) => <MatchCard key={match.id} match={match} />)}
              </div>
              <div className="world-trophy" aria-hidden="true">1</div>
              <div className="champion-box content-center">
                <span>Campeao</span>
                <strong>{champion ?? "A definir"}</strong>
              </div>
            </section>

            <BracketSide rounds={rightRounds} side="right" />
          </div>
        </div>
      </Container>
    </div>
  );
}

function entryName(entry: { displayName: string | null; participant: { publicName: string } } | null) {
  return entry?.displayName ?? entry?.participant.publicName ?? "A definir";
}

function buildSideRounds(rounds: PublicRound[], side: "left" | "right"): SideRound[] {
  return rounds.map((round, roundIndex) => {
    const split = Math.ceil(round.matches.length / 2);
    const sideMatches = side === "left" ? round.matches.slice(0, split) : round.matches.slice(split);
    const fallbackMatches = sideMatches.length > 0 ? sideMatches : round.matches;
    return {
      ...round,
      matches: fallbackMatches.map((match, matchIndex) => ({
        ...match,
        top: matchTop(roundIndex, matchIndex, fallbackMatches.length)
      }))
    };
  });
}

function matchTop(roundIndex: number, matchIndex: number, matchCount: number) {
  const step = 100 / matchCount;
  const center = step * matchIndex + step / 2;
  const pullToMiddle = roundIndex * 2.5;
  return Math.max(7, Math.min(93, center + (center < 50 ? pullToMiddle : -pullToMiddle)));
}

function BracketSide({ rounds, side }: { rounds: SideRound[]; side: "left" | "right" }) {
  return (
    <section className={`world-side world-side-${side}`}>
      {rounds.map((round, roundIndex) => (
        <div className="world-round" key={round.id}>
          <h2>{round.name}</h2>
          {round.matches.map((match) => (
            <div className="world-match-slot" key={match.id} style={{ top: `${match.top}%` }}>
              <MatchCard match={match} side={side} />
            </div>
          ))}
          {roundIndex < rounds.length - 1
            ? buildConnectors(round.matches).map((connector) => (
                <div
                  className={`world-connector world-connector-${side}`}
                  key={connector.key}
                  style={{ top: `${connector.top}%`, height: `${connector.height}%` }}
                />
              ))
            : null}
        </div>
      ))}
    </section>
  );
}

function formatRoundName(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("final")) return "Final";
  if (normalized.includes("semifinal")) return "Semifinais";
  if (normalized.includes("quartas")) return "Quartas";
  if (normalized.includes("oitavas")) return "Oitavas";
  return name.replace("a fase", "a Fase");
}

function buildConnectors(matches: SideMatch[]) {
  const connectors: Array<{ key: string; top: number; height: number }> = [];
  for (let index = 0; index < matches.length - 1; index += 2) {
    const first = matches[index];
    const second = matches[index + 1];
    connectors.push({
      key: `${first.id}-${second.id}`,
      top: Math.min(first.top, second.top),
      height: Math.abs(second.top - first.top)
    });
  }
  return connectors;
}

function MatchCard({ match, side = "center" }: { match: PublicMatch; side?: "left" | "right" | "center" }) {
  return (
    <article className={`world-match-card world-match-${side}`}>
      <div className="world-match-head">
        <strong>Jogo {match.position}</strong>
        <span>{match.winner ? "OK" : match.status === "READY" ? "AO VIVO" : "PEND"}</span>
      </div>
      <div className="world-player-list">
        <PlayerRow name={match.participant1} winner={match.winner === match.participant1} />
        <PlayerRow name={match.participant2} winner={match.winner === match.participant2} />
      </div>
    </article>
  );
}

function PlayerRow({ name, winner }: { name: string; winner: boolean }) {
  return (
    <div className={`public-player-row ${winner ? "public-player-winner" : ""}`}>
      <span className="player-badge" />
      <span>{name}</span>
    </div>
  );
}
