import React, { useMemo, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import CheckoutModal from "./CheckoutModal.jsx";

export default function Cart() {
  const { cart, subtotal, discount, total, loading, removeItem, addToCart, refresh } = useCart();
  const [show, setShow] = useState(false);
  const hasItems = useMemo(() => cart.length > 0, [cart]);

  if (loading) return <div className="card">Loading cart…</div>;

  return (
    <div className="card">
      <h2>Your Cart</h2>
      {!hasItems && <p>No items yet.</p>}
      {hasItems && (
        <ul className="cart">
          {cart.map(item => (
            <li key={item.cartId} className="cart-row">
              <img src={item.image} alt={item.name} />
              <div className="grow">
                <div className="name">{item.name}</div>
                <div className="muted">₹{item.price.toFixed(2)} each</div>
                <div className="qty">
                  <button onClick={() => addToCart(item.productId, Math.max(0, item.qty - 1))}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => addToCart(item.productId, item.qty + 1)}>+</button>
                </div>
              </div>
              <div className="actions">
                <button className="ghost" onClick={() => removeItem(item.cartId)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="totals">
        <div className="row-slim"><span className="muted">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="row-slim"><span className="muted">Discount</span><span>− ₹{discount.toFixed(2)}</span></div>
        <div className="total"><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
      </div>
      <div className="row">
        <button disabled={!hasItems} onClick={() => setShow(true)}>Checkout</button>
        <button className="ghost" onClick={refresh}>Refresh</button>
      </div>
      {show && <CheckoutModal onClose={() => setShow(false)} />}
    </div>
  );
}
