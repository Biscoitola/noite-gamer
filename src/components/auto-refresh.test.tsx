import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoRefresh } from "./auto-refresh";

const { router } = vi.hoisted(() => ({ router: { refresh: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

describe("atualizações automáticas dos resultados", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    router.refresh.mockClear();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

  it("consulta os resultados a cada três segundos sem recarregar a página", () => {
    render(<AutoRefresh />);
    act(() => vi.advanceTimersByTime(3000));
    expect(router.refresh).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(3000));
    expect(router.refresh).toHaveBeenCalledTimes(2);
  });

  it("pausa em segundo plano e atualiza imediatamente ao voltar", () => {
    render(<AutoRefresh />);
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => vi.advanceTimersByTime(9000));
    expect(router.refresh).not.toHaveBeenCalled();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });

  it("retoma quando a conexão volta e remove os listeners ao sair", () => {
    const { unmount } = render(<AutoRefresh />);
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    act(() => vi.advanceTimersByTime(3000));
    expect(router.refresh).not.toHaveBeenCalled();
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    act(() => window.dispatchEvent(new Event("online")));
    expect(router.refresh).toHaveBeenCalledTimes(1);
    unmount();
    act(() => { vi.advanceTimersByTime(9000); window.dispatchEvent(new Event("focus")); });
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });

  it("preserva o intervalo de 30 segundos usado pelo prêmio acumulado", () => {
    render(<AutoRefresh intervalMs={30000} />);
    act(() => vi.advanceTimersByTime(3000));
    expect(router.refresh).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(27000));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
});
