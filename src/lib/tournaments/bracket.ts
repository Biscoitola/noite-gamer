export type BracketEntry = {
  id: string;
  seed?: number;
  publicName: string;
};

export type GeneratedMatch = {
  id: string;
  round: number;
  position: number;
  participant1EntryId: string | null;
  participant2EntryId: string | null;
  winnerEntryId: string | null;
  nextMatchId: string | null;
  nextSlot: 1 | 2 | null;
  status: "PENDING" | "READY" | "BYE" | "FINISHED";
};

export type GeneratedBracket = {
  bracketSize: number;
  rounds: { number: number; name: string; order: number }[];
  matches: GeneratedMatch[];
};

export function nextPowerOfTwo(value: number) {
  if (value < 2) return 2;
  return 2 ** Math.ceil(Math.log2(value));
}

export function generateSingleEliminationBracket(entries: BracketEntry[]): GeneratedBracket {
  const uniqueIds = new Set(entries.map((entry) => entry.id));
  if (uniqueIds.size !== entries.length) {
    throw new Error("Participante duplicado no chaveamento.");
  }
  if (entries.length < 1) {
    throw new Error("Sao necessarios participantes confirmados.");
  }
  if (entries.length > 64) {
    throw new Error("O limite inicial e de 64 participantes.");
  }

  const seeded = [...entries].sort((a, b) => (a.seed ?? 9999) - (b.seed ?? 9999));
  const bracketSize = nextPowerOfTwo(seeded.length);
  return generateRoundByRoundBracket(seeded, bracketSize);
}

type RoundEntrant =
  | { type: "entry"; entryId: string }
  | { type: "match"; matchId: string };

type PlannedMatch = {
  id: string;
  round: number;
  position: number;
  entrant1: RoundEntrant;
  entrant2: RoundEntrant;
  nextMatchId: string | null;
  nextSlot: 1 | 2 | null;
};

function generateRoundByRoundBracket(entries: BracketEntry[], bracketSize: number): GeneratedBracket {
  if (entries.length === 1) {
    return {
      bracketSize,
      rounds: [{ number: 1, name: "Final", order: 1 }],
      matches: [
        {
          id: matchId(1, 1),
          round: 1,
          position: 1,
          participant1EntryId: entries[0].id,
          participant2EntryId: null,
          winnerEntryId: entries[0].id,
          nextMatchId: null,
          nextSlot: null,
          status: "BYE"
        }
      ]
    };
  }

  const plannedMatches: PlannedMatch[] = [];
  let round = 1;
  let entrants = pairSeededEntries(entries).map<RoundEntrant>((entry) => ({ type: "entry", entryId: entry.id }));

  while (entrants.length > 1) {
    const nextEntrants: RoundEntrant[] = [];
    let position = 1;
    for (let index = 0; index + 1 < entrants.length; index += 2) {
      const id = matchId(round, position);
      plannedMatches.push({
        id,
        round,
        position,
        entrant1: entrants[index],
        entrant2: entrants[index + 1],
        nextMatchId: null,
        nextSlot: null
      });
      nextEntrants.push({ type: "match", matchId: id });
      position += 1;
    }
    if (entrants.length % 2 === 1) {
      nextEntrants.push(entrants[entrants.length - 1]);
    }
    entrants = nextEntrants;
    round += 1;
  }

  for (const match of plannedMatches) {
    const entrant1 = match.entrant1;
    const entrant2 = match.entrant2;
    if (entrant1.type === "match") {
      const source = plannedMatches.find((candidate) => candidate.id === entrant1.matchId);
      if (source) {
        source.nextMatchId = match.id;
        source.nextSlot = 1;
      }
    }
    if (entrant2.type === "match") {
      const source = plannedMatches.find((candidate) => candidate.id === entrant2.matchId);
      if (source) {
        source.nextMatchId = match.id;
        source.nextSlot = 2;
      }
    }
  }

  const roundCount = Math.max(...plannedMatches.map((match) => match.round));
  const rounds = Array.from({ length: roundCount }, (_, index) => ({
    number: index + 1,
    name: roundName(index + 1, roundCount),
    order: index + 1
  }));

  return {
    bracketSize,
    rounds,
    matches: plannedMatches.map((match) => ({
      id: match.id,
      round: match.round,
      position: match.position,
      participant1EntryId: match.entrant1.type === "entry" ? match.entrant1.entryId : null,
      participant2EntryId: match.entrant2.type === "entry" ? match.entrant2.entryId : null,
      winnerEntryId: null,
      nextMatchId: match.nextMatchId,
      nextSlot: match.nextSlot,
      status: match.entrant1.type === "entry" && match.entrant2.type === "entry" ? "READY" : "PENDING"
    }))
  };
}

function pairSeededEntries(entries: BracketEntry[]) {
  const ordered: BracketEntry[] = [];
  let left = 0;
  let right = entries.length - 1;
  while (left <= right) {
    ordered.push(entries[left]);
    if (left !== right) ordered.push(entries[right]);
    left += 1;
    right -= 1;
  }
  return ordered;
}

function matchId(round: number, position: number) {
  return `r${round}m${position}`;
}

export function advanceWinner(matches: GeneratedMatch[], matchId: string, winnerEntryId: string | null) {
  const match = matches.find((item) => item.id === matchId);
  if (!match || !winnerEntryId || !match.nextMatchId || !match.nextSlot) return;
  const next = matches.find((item) => item.id === match.nextMatchId);
  if (!next) return;
  if (match.nextSlot === 1) next.participant1EntryId = winnerEntryId;
  if (match.nextSlot === 2) next.participant2EntryId = winnerEntryId;
  if (next.participant1EntryId && next.participant2EntryId) next.status = "READY";
}

export function recordWinner(matches: GeneratedMatch[], matchId: string, winnerEntryId: string) {
  const match = matches.find((item) => item.id === matchId);
  if (!match) throw new Error("Partida nao encontrada.");
  if (!match.participant1EntryId || !match.participant2EntryId) {
    throw new Error("Nao e possivel registrar vencedor sem dois participantes definidos.");
  }
  if (![match.participant1EntryId, match.participant2EntryId].includes(winnerEntryId)) {
    throw new Error("Vencedor nao pertence a partida.");
  }
  const dependent = matches.find((item) => item.id === match.nextMatchId);
  if (dependent?.winnerEntryId) {
    throw new Error("Resultado bloqueado porque a partida seguinte ja possui resultado.");
  }
  match.winnerEntryId = winnerEntryId;
  match.status = "FINISHED";
  advanceWinner(matches, match.id, winnerEntryId);
}

function roundName(round: number, roundCount: number) {
  if (round === roundCount) return "Final";
  if (round === roundCount - 1) return "Semifinal";
  if (round === roundCount - 2) return "Quartas";
  if (round === roundCount - 3) return "Oitavas";
  return `${round}a fase`;
}
