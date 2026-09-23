export type EditionCommerceSettings = {
  comboEnabled: boolean;
  comboPrice: number;
  showPrizePool: boolean;
  prizePoolPercent: number;
};

export function readEditionCommerceSettings(value: unknown): EditionCommerceSettings {
  const settings = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
  return {
    comboEnabled: settings.comboEnabled === true,
    comboPrice: validNumber(settings.comboPrice, 0, 999999.99, 24.9),
    showPrizePool: settings.showPrizePool === true,
    prizePoolPercent: validNumber(settings.prizePoolPercent, 0, 100, 90)
  };
}

function validNumber(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? value : fallback;
}

export function calculatePrizePool(paidAmount: number, percent: number) {
  const paidCents = Math.max(0, Math.round(paidAmount * 100));
  return Math.round(paidCents * percent / 100) / 100;
}

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
