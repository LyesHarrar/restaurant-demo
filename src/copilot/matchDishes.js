import { dishes } from "../data";

// Demo-only "AI": a small keyword → tag dictionary matched against each
// dish's tags. No real model call — good enough to show the conversational
// flow without the cost/complexity of a live LLM integration.
const KEYWORD_TAGS = {
  leger: "light",
  legere: "light",
  healthy: "healthy",
  sain: "healthy",
  saine: "healthy",
  epice: "spicy",
  epicee: "spicy",
  piquant: "spicy",
  vege: "vegetarian",
  vegetarien: "vegetarian",
  vegetarienne: "vegetarian",
  sucre: "sweet",
  sucree: "sweet",
  dessert: "sweet",
  reconfortant: "comfort",
  reconfortante: "comfort",
  gourmand: "comfort",
  copieux: "comfort",
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function extractTags(query) {
  const words = normalize(query).split(/\W+/).filter(Boolean);
  const tags = new Set();
  for (const word of words) {
    for (const [keyword, tag] of Object.entries(KEYWORD_TAGS)) {
      if (keyword.startsWith(word) || word.startsWith(keyword)) {
        tags.add(tag);
      }
    }
  }
  return [...tags];
}

// Returns up to 3 dishes matching the free-text query, filtering out any
// dish containing a declared allergen — a strict constraint, never a
// weighted preference, per the spec's management rules.
export function matchDishes(query, { excludeAllergens = [] } = {}) {
  const tags = extractTags(query);
  if (tags.length === 0) {
    return { tags: [], results: [] };
  }

  const safeDishes = dishes.filter(
    (dish) => !dish.allergens.some((allergen) => excludeAllergens.includes(allergen))
  );

  const scored = safeDishes
    .map((dish) => ({ dish, score: dish.tags.filter((t) => tags.includes(t)).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return { tags, results: scored.slice(0, 3).map((entry) => entry.dish) };
}
