export type PriceItem = {
  gameId: string;
  price: number;
  discount?: number;
};

export type Coupon = {
  code: string;
  type: "fixed" | "percent";
  value: number;
  active: boolean;
};

export function calculateRegistrationTotal(items: PriceItem[], coupon?: Coupon) {
  const subtotal = items.reduce((sum, item) => sum + item.price - (item.discount ?? 0), 0);
  const multiGameDiscount = items.length >= 3 ? 10 : items.length === 2 ? 5 : 0;
  const couponDiscount =
    coupon?.active === true
      ? coupon.type === "fixed"
        ? coupon.value
        : (subtotal * coupon.value) / 100
      : 0;
  const total = Math.max(0, subtotal - multiGameDiscount - couponDiscount);
  return {
    subtotal: roundMoney(subtotal),
    multiGameDiscount: roundMoney(multiGameDiscount),
    couponDiscount: roundMoney(couponDiscount),
    total: roundMoney(total)
  };
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function hasCapacity(capacity: number, confirmed: number, reserved: number, requested = 1) {
  return confirmed + reserved + requested <= capacity;
}
