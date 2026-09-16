import { useState } from "react";
import { dishes } from "../data";
import { getUsualOrder } from "../copilot/mockHistory";
import { mockUser } from "../copilot/mockUser";
import { initialColleagues } from "../copilot/mockParticipants";
import { trackEvent } from "../copilot/tracking";
import { useCopilotFlags } from "../copilot/flagsContext";
import AiBadge from "./AiBadge";

const usual = getUsualOrder();
const defaultDish = usual?.dishes[0] ?? dishes[0];

export default function CopilotGroupOrder({ onPayMine }) {
  const { flags } = useCopilotFlags();
  const [myDishId, setMyDishId] = useState(defaultDish.id);
  const [myConfirmed, setMyConfirmed] = useState(false);
  const [colleagues, setColleagues] = useState(initialColleagues);
  const [closed, setClosed] = useState(false);
  const [myPaid, setMyPaid] = useState(false);
  const [paidColleagueIds, setPaidColleagueIds] = useState([]);

  if (!flags.release3) return null;

  const myDish = dishes.find((d) => d.id === Number(myDishId));

  function confirmColleague(id) {
    setColleagues((prev) =>
      prev.map((c) => (c.id === id ? { ...c, confirmed: true } : c))
    );
    const colleague = colleagues.find((c) => c.id === id);
    trackEvent("copilot_group_cart_confirmed", {
      groupSessionId: "demo-team-lunch",
      participant: colleague?.name,
      amount: colleague?.dish.price,
    });
  }

  function confirmMine() {
    setMyConfirmed(true);
    trackEvent("copilot_group_cart_confirmed", {
      groupSessionId: "demo-team-lunch",
      participant: mockUser.name,
      amount: myDish.price,
    });
  }

  function closeCart() {
    setClosed(true);
  }

  function payMine() {
    setMyPaid(true);
    onPayMine({ ...myDish, quantity: 1 });
  }

  function payColleague(id) {
    setPaidColleagueIds((prev) => [...prev, id]);
  }

  const confirmedColleagues = colleagues.filter((c) => c.confirmed);
  const excludedColleagues = colleagues.filter((c) => !c.confirmed);

  return (
    <details className="copilot-group">
      <summary className="copilot-group-summary">👥 Coordination groupe — déjeuner d'équipe</summary>
      <div className="copilot-group-body">
        <span className="copilot-group-channel">💬 Connecté à #team-lunch (démo)</span>
        <AiBadge label="Parts suggérées par IA" />

        {!closed && (
          <>
            <div className="copilot-group-row">
              <span className="copilot-group-name">{mockUser.name} (vous)</span>
              {myConfirmed ? (
                <span className="copilot-group-dish">{myDish.emoji} {myDish.name} — €{myDish.price.toFixed(2)}</span>
              ) : (
                <select
                  className="copilot-group-select"
                  value={myDishId}
                  onChange={(e) => setMyDishId(e.target.value)}
                >
                  {dishes.map((d) => (
                    <option key={d.id} value={d.id}>{d.emoji} {d.name} — €{d.price.toFixed(2)}</option>
                  ))}
                </select>
              )}
              {myConfirmed ? (
                <span className="copilot-group-status confirmed">Confirmé</span>
              ) : (
                <button className="copilot-group-confirm-btn" onClick={confirmMine}>Confirmer ma part</button>
              )}
            </div>

            {colleagues.map((c) => (
              <div key={c.id} className="copilot-group-row">
                <span className="copilot-group-name">{c.name}</span>
                <span className="copilot-group-dish">{c.dish.emoji} {c.dish.name} — €{c.dish.price.toFixed(2)}</span>
                {c.confirmed ? (
                  <span className="copilot-group-status confirmed">Confirmé</span>
                ) : (
                  <>
                    <span className="copilot-group-status pending">En attente</span>
                    <button className="copilot-group-confirm-btn" onClick={() => confirmColleague(c.id)}>Confirmer pour {c.name}</button>
                  </>
                )}
              </div>
            ))}

            <button className="copilot-group-close-btn" onClick={closeCart}>Clôturer le panier</button>
          </>
        )}

        {closed && (
          <>
            <p className="copilot-chat-hint">Panier clôturé — chaque participant paie sa part individuellement.</p>

            <div className="copilot-group-row">
              <span className="copilot-group-name">{mockUser.name} (vous)</span>
              <span className="copilot-group-dish">{myDish.emoji} {myDish.name} — €{myDish.price.toFixed(2)}</span>
              {myConfirmed ? (
                myPaid ? (
                  <span className="copilot-group-paid">Payé ✓</span>
                ) : (
                  <button className="copilot-group-pay-btn" onClick={payMine}>Payer</button>
                )
              ) : (
                <span className="copilot-group-excluded">Non inclus (pas confirmé)</span>
              )}
            </div>

            {confirmedColleagues.map((c) => (
              <div key={c.id} className="copilot-group-row">
                <span className="copilot-group-name">{c.name}</span>
                <span className="copilot-group-dish">{c.dish.emoji} {c.dish.name} — €{c.dish.price.toFixed(2)}</span>
                {paidColleagueIds.includes(c.id) ? (
                  <span className="copilot-group-paid">Payé ✓</span>
                ) : (
                  <button className="copilot-group-pay-btn" onClick={() => payColleague(c.id)}>Payer (simulé)</button>
                )}
              </div>
            ))}

            {excludedColleagues.length > 0 && (
              <p className="copilot-group-excluded">
                Non inclus (pas confirmé avant la clôture) : {excludedColleagues.map((c) => c.name).join(", ")}
              </p>
            )}
          </>
        )}
      </div>
    </details>
  );
}
