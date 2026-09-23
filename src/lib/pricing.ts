export type PriceItem = {
  gameId: string;
  price: number;
  discount?: number;
};

export type Coupon = {
  code: string;
  type: "fixed" | "percent" | "FIXED" | "PERCENT";
  value: number;
  active: boolean;
};

export function calculateRegistrationTotal(items: PriceItem[], coupon?: Coupon, combo?: { comboEnabled: boolean; comboPrice: number }) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price - (item.discount ?? 0), 0));
  const multiGameDiscount = combo
    ? combo.comboEnabled && items.length === 2 ? Math.max(0, subtotal - combo.comboPrice) : 0
    : items.length >= 3 ? 10 : items.length === 2 ? 5 : 0;
  const rawCouponDiscount =
    coupon?.active === true
      ? coupon.type === "fixed" || coupon.type === "FIXED"
        ? coupon.value
        : ((subtotal - multiGameDiscount) * coupon.value) / 100
      : 0;
  const couponDiscount = roundMoney(Math.min(Math.max(0, rawCouponDiscount), Math.max(0, subtotal - multiGameDiscount)));
  const total = Math.max(0, subtotal - multiGameDiscount - couponDiscount);
  return {
    subtotal: roundMoney(subtotal),
    multiGameDiscount: roundMoney(multiGameDiscount),
    couponDiscount: roundMoney(couponDiscount),
    total: roundMoney(total)
  };
}

// Allocate all discounts in cents so item totals always match the Pix amount.
export function allocateItemPrices(items: PriceItem[], total: number) {
  const weights = items.map((item) => Math.max(0, Math.round((item.price - (item.discount ?? 0)) * 100)));
  const subtotal = weights.reduce((sum, value) => sum + value, 0);
  const totalCents = Math.max(0, Math.round(total * 100));
  let cumulativeWeight = 0;
  let allocated = 0;
  return items.map((item, index) => {
    cumulativeWeight += weights[index];
    const cumulativeAmount = subtotal === 0 ? 0 : Math.round(totalCents * cumulativeWeight / subtotal);
    const finalPrice = (cumulativeAmount - allocated) / 100;
    allocated = cumulativeAmount;
    return { gameId: item.gameId, finalPrice, discount: roundMoney(item.price - finalPrice) };
  });
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function hasCapacity(capacity: number, confirmed: number, reserved: number, requested = 1) {
  return confirmed + reserved + requested <= capacity;
}
