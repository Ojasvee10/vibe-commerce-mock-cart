import React, { useState } from "react";
import { apiPost } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

export default function CheckoutModal({ onClose }) {
  const { refresh } = useCart();
  const [name, setName] = useState(localStorage.getItem("user") || "");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const r = await apiPost("/api/checkout", {});
      setReceipt(r);
      toast.success("Order placed (mock)!");
      await refresh();
    } catch (e) {
      setError("Checkout failed.");
      toast.error("Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const exportPDF = () => {
    if (!receipt) return;
    const doc = new jsPDF();
    let y = 12;
    doc.text(`Receipt #${receipt.id}`, 10, y); y += 8;
    doc.text(`Name: ${name || "-"}`, 10, y); y += 8;
    doc.text(`Email: ${email || "-"}`, 10, y); y += 8;
    doc.text(`Date: ${new Date(receipt.timestamp).toLocaleString()}`, 10, y); y += 10;
    receipt.items.forEach((it, i) => { doc.text(`${i+1}. ${it.name} x${it.qty} — ₹${(it.qty * it.price).toFixed(2)}`, 10, y); y += 8; });
    y += 4; doc.text(`Subtotal: ₹${receipt.subtotal.toFixed(2)}`, 10, y); y += 8;
    doc.text(`Discount: ₹${receipt.discount.toFixed(2)}`, 10, y); y += 8;
    doc.text(`Total: ₹${receipt.total.toFixed(2)}`, 10, y);
    doc.save("receipt.pdf");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {!receipt ? (
          <form onSubmit={onSubmit}>
            <h3>Checkout</h3>
            <label> Name <input value={name} onChange={e => setName(e.target.value)} required /> </label>
            <label> Email <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /> </label>
            {error && <p className="error">{error}</p>}
            <div className="row">
              <button type="submit" disabled={submitting}>{submitting ? "Processing…" : "Pay (Mock)"}</button>
              <button type="button" className="ghost" onClick={onClose}>Close</button>
            </div>
            <p className="muted small">No real payments. Generates a mock receipt.</p>
          </form>
        ) : (
          <div>
            <h3>Receipt</h3>
            <p><strong>Order ID:</strong> {receipt.id}</p>
            <p><strong>When:</strong> {new Date(receipt.timestamp).toLocaleString()}</p>
            <ul className="receipt">
              {receipt.items.map(it => (
                <li key={it.cartId}>
                  {it.qty} × {it.name} — ₹{(it.qty * it.price).toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="totals">
              <div className="row-slim"><span className="muted">Subtotal</span><span>₹{receipt.subtotal.toFixed(2)}</span></div>
              <div className="row-slim"><span className="muted">Discount</span><span>− ₹{receipt.discount.toFixed(2)}</span></div>
              <div className="total"><span>Total</span><strong>₹{receipt.total.toFixed(2)}</strong></div>
            </div>
            <div className="row">
              <button onClick={exportPDF}>Download PDF</button>
              <button className="ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
