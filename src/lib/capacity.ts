export const ACTIVE_REGISTRATION_STATUSES = ["AGUARDANDO_PAGAMENTO", "CONFIRMADA"] as const;
export const OCCUPIED_ITEM_STATUSES = ["RESERVED", "CONFIRMED"] as const;

export function remainingSlots(capacity: number, occupied: number) {
  return Math.max(0, capacity - occupied);
}
