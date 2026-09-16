import { dishes } from "../data";

// Demo-only order history: no backend, no real timestamps — just enough
// repeated entries to demonstrate the "usual order" detection rule from the
// spec (same dish/restaurant on the same weekday + time slot, at least twice).
export const orderHistory = [
  { id: "h1", dayOfWeek: 2, slot: "Déjeuner · 12:30", items: [{ dishId: 7, quantity: 1 }, { dishId: 11, quantity: 1 }] },
  { id: "h2", dayOfWeek: 2, slot: "Déjeuner · 12:30", items: [{ dishId: 7, quantity: 1 }, { dishId: 11, quantity: 1 }] },
  { id: "h3", dayOfWeek: 4, slot: "Dîner · 19:30", items: [{ dishId: 5, quantity: 1 }] },
];

function resolveItems(items, excludeDishIds) {
  return items
    .filter(({ dishId }) => !excludeDishIds.includes(dishId))
    .map(({ dishId, quantity }) => {
      const dish = dishes.find((d) => d.id === dishId);
      return dish ? { ...dish, quantity } : null;
    })
    .filter(Boolean);
}

// Finds the most-repeated (day, slot) combination that occurred at least
// twice, and resolves it against the current menu/prices — never the price
// stored at order time, so a price change is always reflected.
export function getUsualOrder({ excludeDishIds = [] } = {}) {
  const buckets = new Map();
  for (const order of orderHistory) {
    const key = `${order.dayOfWeek}-${order.slot}`;
    const bucket = buckets.get(key) || { count: 0, order };
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  let best = null;
  for (const bucket of buckets.values()) {
    if (bucket.count >= 2 && (!best || bucket.count > best.count)) best = bucket;
  }
  if (!best) return null;

  const resolvedItems = resolveItems(best.order.items, excludeDishIds);
  if (resolvedItems.length === 0) return null;

  return {
    dayOfWeek: best.order.dayOfWeek,
    slot: best.order.slot,
    dishes: resolvedItems,
  };
}
