import { getEffectivePrice } from "../pricing";

export default function Cart({ cart, onRemove, onUpdateQuantity, onCheckout, priceAdjustments }) {
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = getEffectivePrice(item.price, priceAdjustments[item.id]);
    return sum + unitPrice * item.quantity;
  }, 0);

  const tax = subtotal * 0.20;
  const total = subtotal + tax;

  return (
    <aside className="cart">
      <h2>Your Order</h2>

      {cart.length === 0 ? (
        <p className="cart-empty">No items yet.</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => {
            const adjustment = priceAdjustments[item.id];
            const unitPrice = getEffectivePrice(item.price, adjustment);
            return (
              <li key={item.id} className="cart-item">
                <span className="cart-item-emoji">{item.emoji}</span>
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name}</span>
                  <div className="cart-item-qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="cart-item-qty">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="cart-item-price">
                  €{(unitPrice * item.quantity).toFixed(2)}
                  {adjustment && (
                    <span className={`price-badge price-badge--${adjustment}`}>
                      {adjustment === "discount" ? "-20%" : "+20%"}
                    </span>
                  )}
                </span>
                <button className="remove-btn" onClick={() => onRemove(item.id)}>✕</button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="cart-totals">
        <div className="cart-totals-row">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="cart-totals-row">
          <span>Tax (20%)</span>
          <span>€{tax.toFixed(2)}</span>
        </div>
        <div className="cart-totals-row total">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        className="checkout-btn"
        disabled={cart.length === 0}
        onClick={onCheckout}
      >
        Place Order
      </button>
    </aside>
  );
}
