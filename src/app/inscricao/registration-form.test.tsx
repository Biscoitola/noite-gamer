import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegistrationForm } from "./registration-form";

vi.mock("./actions", () => ({ submitRegistration: vi.fn() }));

describe("resumo da inscrição", () => {
  afterEach(cleanup);
  it("atualiza o valor ao marcar e desmarcar os jogos", () => {
    render(<RegistrationForm disabled={false} commerceSettings={{ comboEnabled: true, comboPrice: 24.9, showPrizePool: true, prizePoolPercent: 90 }} games={[
      { id: "rocket", name: "Rocket League", price: 15, capacity: 32, remaining: 32, teamMode: "SOLO" },
      { id: "mk", name: "Mortal Kombat", price: 15, capacity: 32, remaining: 32, teamMode: "SOLO" }
    ]} />);
    expect(screen.getByText(/Total:/)).toHaveTextContent("0,00");
    fireEvent.click(screen.getByRole("checkbox", { name: /Rocket League/ }));
    expect(screen.getByText(/Total:/)).toHaveTextContent("15,00");
    fireEvent.click(screen.getByRole("checkbox", { name: /Mortal Kombat/ }));
    expect(screen.getByText(/Total:/)).toHaveTextContent("24,90");
    expect(screen.getByText(/Desconto do combo:/)).toHaveTextContent("5,10");
    fireEvent.click(screen.getByRole("checkbox", { name: /Rocket League/ }));
    expect(screen.getByText(/Total:/)).toHaveTextContent("15,00");
  });
});
