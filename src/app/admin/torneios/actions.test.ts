import { beforeEach, describe, expect, it, vi } from "vitest";
import { winnerAction, undoWinnerAction } from "./actions";

const mocks = vi.hoisted(() => ({ save: vi.fn(), undo: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(url); } }));
vi.mock("@/lib/tournaments/service", () => ({ registerMatchWinner: mocks.save, undoMatchWinner: mocks.undo }));

describe("publicação dos vencedores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue({});
    mocks.undo.mockResolvedValue({ gameSlug: "rocket-league" });
  });

  it.each([winnerAction, undoWinnerAction])("atualiza todas as telas públicas ao salvar ou desfazer", async action => {
    const data = new FormData();
    data.set("matchId", "match");
    data.set("winnerEntryId", "winner");
    await expect(action(data)).rejects.toThrow("success=");
    expect(mocks.revalidate).toHaveBeenCalledWith("/torneios/[slug]", "page");
    for (const path of ["/torneios", "/ao-vivo", "/sorteios", "/admin/sorteios"]) {
      expect(mocks.revalidate).toHaveBeenCalledWith(path);
    }
  });
});
