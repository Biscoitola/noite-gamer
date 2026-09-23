import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateEditionCommerceAction } from "./actions";

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn(), requireAdminRole: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdminRole: mocks.requireAdminRole }));
vi.mock("@/lib/db", () => ({ prisma: { event: { findUnique: mocks.findUnique, update: mocks.update } } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(url); } }));

function form() {
  const data = new FormData();
  data.set("eventId", "edition");
  data.set("comboEnabled", "on");
  data.set("comboPrice", "24,90");
  data.set("showPrizePool", "on");
  data.set("prizePoolPercent", "90");
  return data;
}

describe("configurações financeiras da edição", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdminRole.mockResolvedValue({});
    mocks.findUnique.mockResolvedValue({ id: "edition", settings: { paymentExpiresInMinutes: 45, theme: "nexus" } });
  });

  it("salva os controles sem apagar outras configurações", async () => {
    await expect(updateEditionCommerceAction(form())).rejects.toThrow("success=");
    expect(mocks.requireAdminRole).toHaveBeenCalledWith("ADMIN");
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "edition" }, data: { settings: {
      paymentExpiresInMinutes: 45, theme: "nexus", comboEnabled: true, comboPrice: 24.9, showPrizePool: true, prizePoolPercent: 90
    } } });
  });

  it("permite ocultar o prêmio e desativar o combo", async () => {
    const data = form();
    data.delete("showPrizePool");
    data.delete("comboEnabled");
    await expect(updateEditionCommerceAction(data)).rejects.toThrow("success=");
    expect(mocks.update.mock.calls[0][0].data.settings).toMatchObject({ comboEnabled: false, showPrizePool: false });
  });

  it.each([["comboPrice", "-1"], ["comboPrice", "NaN"], ["comboPrice", "24.901"], ["prizePoolPercent", "101"], ["prizePoolPercent", ""]])("rejeita %s=%s no servidor", async (key, value) => {
    const data = form();
    data.set(key, value);
    await expect(updateEditionCommerceAction(data)).rejects.toThrow("error=");
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
