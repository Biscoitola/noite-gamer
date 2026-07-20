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
  if (entries.length < 2) {
    throw new Error("Sao necessarios ao menos 2 participantes.");
  }
  if (entries.length > 64) {
    throw new Error("O limite inicial e de 64 participantes.");
  }

  const seeded = [...entries].sort((a, b) => (a.seed ?? 9999) - (b.seed ?? 9999));
  const bracketSize = nextPowerOfTwo(seeded.length);
  const roundCount = Math.log2(bracketSize);
  const slots = distributeByes(seeded, bracketSize);
  const rounds = Array.from({ length: roundCount }, (_, index) => ({
    number: index + 1,
    name: roundName(index + 1, roundCount),
    order: index + 1
  }));

  const matches: GeneratedMatch[] = [];
  const matchId = (round: number, position: number) => `r${round}m${position}`;

  for (let position = 1; position <= bracketSize / 2; position += 1) {
    const p1 = slots[(position - 1) * 2] ?? null;
    const p2 = slots[(position - 1) * 2 + 1] ?? null;
    const winner = p1 && !p2 ? p1.id : !p1 && p2 ? p2.id : null;
    matches.push({
      id: matchId(1, position),
      round: 1,
      position,
      participant1EntryId: p1?.id ?? null,
      participant2EntryId: p2?.id ?? null,
      winnerEntryId: winner,
      nextMatchId: roundCount > 1 ? matchId(2, Math.ceil(position / 2)) : null,
      nextSlot: roundCount > 1 ? (((position - 1) % 2) + 1 as 1 | 2) : null,
      status: winner ? "BYE" : "READY"
    });
  }

  for (let round = 2; round <= roundCount; round += 1) {
    const matchCount = bracketSize / 2 ** round;
    for (let position = 1; position <= matchCount; position += 1) {
      matches.push({
        id: matchId(round, position),
        round,
        position,
        participant1EntryId: null,
        participant2EntryId: null,
        winnerEntryId: null,
        nextMatchId: round < roundCount ? matchId(round + 1, Math.ceil(position / 2)) : null,
        nextSlot: round < roundCount ? (((position - 1) % 2) + 1 as 1 | 2) : null,
        status: "PENDING"
      });
    }
  }

  for (const byeMatch of matches.filter((match) => match.status === "BYE")) {
    advanceWinner(matches, byeMatch.id, byeMatch.winnerEntryId);
  }

  return { bracketSize, rounds, matches };
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

function distributeByes(entries: BracketEntry[], bracketSize: number) {
  const slots: Array<BracketEntry | null> = Array.from({ length: bracketSize }, () => null);
  const order = seedOrder(bracketSize);
  entries.forEach((entry, index) => {
    slots[order[index] - 1] = entry;
  });
  return slots;
}

function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const nextSize = order.length * 2;
    order = order.flatMap((seed) => [seed, nextSize + 1 - seed]);
  }
  return order;
}

function roundName(round: number, roundCount: number) {
  if (round === roundCount) return "Final";
  if (round === roundCount - 1) return "Semifinal";
  if (round === roundCount - 2) return "Quartas";
  if (round === roundCount - 3) return "Oitavas";
  return `${round}a fase`;
}
