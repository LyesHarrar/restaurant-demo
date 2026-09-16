import { useEffect, useMemo, useState } from "react";
import { getUsualOrder } from "../copilot/mockHistory";
import { trackEvent } from "../copilot/tracking";
import { MAX_SUGGESTION_DISMISSALS, useCopilotFlags } from "../copilot/flagsContext";
import AiBadge from "./AiBadge";

// The dish id the "simulate unavailable" demo toggle pretends is 86'd.
const SIMULATED_UNAVAILABLE_DISH_ID = 7;

export default function CopilotSuggestionBanner({ onOrderNow }) {
  const { flags, dismissCount, registerSuggestionDismiss } = useCopilotFlags();
  const [confirmed, setConfirmed] = useState(false);

  const usual = useMemo(
    () =>
      getUsualOrder({
        excludeDishIds: flags.simulateUnavailable ? [SIMULATED_UNAVAILABLE_DISH_ID] : [],
      }),
    [flags.simulateUnavailable]
  );

  const isVisible =
    flags.release1 && !!usual && !confirmed && dismissCount < MAX_SUGGESTION_DISMISSALS;

  useEffect(() => {
    if (isVisible) {
      trackEvent("copilot_suggestion_shown", {
        restaurantId: "roofood",
        slot: usual.slot,
      });
    }
    // Only re-fire when the suggestion actually (re)appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  if (!isVisible) return null;

  const total = usual.dishes.reduce((sum, d) => sum + d.price * d.quantity, 0);

  function handleOrderNow() {
    trackEvent("copilot_suggestion_confirmed", {
      slot: usual.slot,
      amount: total,
    });
    setConfirmed(true);
    onOrderNow(usual.dishes);
  }

  function handleDismiss() {
    registerSuggestionDismiss();
  }

  return (
    <div className="copilot-banner">
      <span className="copilot-banner-icon" aria-hidden="true">🔁</span>
      <div className="copilot-banner-body">
        <div className="copilot-banner-title">
          Comme d'habitude le {usual.slot.toLowerCase()} ?
          <AiBadge />
        </div>
        <p className="copilot-banner-subtitle">Basé sur vos commandes précédentes à ce créneau.</p>
        <div className="copilot-banner-items">
          {usual.dishes.map((dish) => (
            <span key={dish.id} className="copilot-banner-item">
              {dish.emoji} {dish.name} x{dish.quantity}
            </span>
          ))}
        </div>
      </div>
      <span className="copilot-banner-price">€{total.toFixed(2)}</span>
      <div className="copilot-banner-actions">
        <button className="modal-btn-secondary" onClick={handleDismiss}>Non merci</button>
        <button className="modal-btn-primary" onClick={handleOrderNow}>Commander en 1 clic</button>
      </div>
    </div>
  );
}
