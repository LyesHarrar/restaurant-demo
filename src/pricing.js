export const DISCOUNT_PERCENT = 20;
export const INCREASE_PERCENT = 20;
export const DISCOUNT_COUNT = 2;
export const INCREASE_COUNT = 3;
export const ADJUSTMENT_INTERVAL_MS = 5 * 60 * 1000;

export function rollPriceAdjustments(dishes) {
  const shuffled = [...dishes].sort(() => Math.random() - 0.5);
  const adjustments = {};

  shuffled.slice(0, DISCOUNT_COUNT).forEach((dish) => {
    adjustments[dish.id] = "discount";
  });
  shuffled.slice(DISCOUNT_COUNT, DISCOUNT_COUNT + INCREASE_COUNT).forEach((dish) => {
    adjustments[dish.id] = "increase";
  });

  return adjustments;
}

export function getEffectivePrice(basePrice, adjustment) {
  if (adjustment === "discount") return basePrice * (1 - DISCOUNT_PERCENT / 100);
  if (adjustment === "increase") return basePrice * (1 + INCREASE_PERCENT / 100);
  return basePrice;
}
