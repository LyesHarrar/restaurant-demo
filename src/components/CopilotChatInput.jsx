import { useState } from "react";
import { matchDishes } from "../copilot/matchDishes";
import { mockUser } from "../copilot/mockUser";
import { trackEvent } from "../copilot/tracking";
import { useCopilotFlags } from "../copilot/flagsContext";
import AiBadge from "./AiBadge";

export default function CopilotChatInput({ onAddToCart }) {
  const { flags } = useCopilotFlags();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  if (!flags.release2) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const matched = matchDishes(trimmed, { excludeAllergens: mockUser.allergies });
    setResult(matched);

    trackEvent("copilot_conversational_query_sent", {
      queryLength: trimmed.length,
      resultsCount: matched.results.length,
    });
  }

  const hasResults = result && result.results.length > 0;

  return (
    <section className="copilot-chat">
      <div className="copilot-chat-header">
        <h2>Une envie précise ?</h2>
        <AiBadge />
      </div>
      <form className="copilot-chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="copilot-chat-input"
          placeholder='Ex. "quelque chose de léger et épicé"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="copilot-chat-submit">Demander au Copilot</button>
      </form>

      {result && (
        hasResults ? (
          <>
            <div className="copilot-chat-results">
              {result.results.map((dish) => (
                <div key={dish.id} className="copilot-chat-card">
                  <span className="dish-emoji">{dish.emoji}</span>
                  <div className="copilot-chat-card-info">
                    <h3>{dish.name}</h3>
                    <p>{dish.description}</p>
                    <div className="dish-footer">
                      <span className="dish-price">€{dish.price.toFixed(2)}</span>
                      <button className="add-btn" onClick={() => onAddToCart(dish)}>Add to cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="copilot-chat-hint">Suggestions indicatives (démo) — précisez votre envie pour affiner.</p>
          </>
        ) : (
          <p className="copilot-chat-fallback">
            Je n'ai pas de suggestion fiable pour cette envie. Essayez de préciser (ex. "léger et sucré"), ou parcourez le menu ci-dessous.
          </p>
        )
      )}
    </section>
  );
}
