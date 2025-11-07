import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { apiGet } from "../api.js";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      try { setProducts(await apiGet("/api/products")); }
      catch { setError("Failed to load products."); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="products">
        {Array.from({ length: 8 }).map((_, i) => <div className="card skeleton" key={i} />)}
      </div>
    );
  }
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="products">
      {products.map(p => (
        <div className="card product hoverable" key={p.id}>
          <img src={p.image} alt={p.name} />
          <div className="info">
            <div className="name">{p.name}</div>
            <div className="price">₹{p.price.toFixed(2)}</div>
          </div>
          <div className="row">
            <button onClick={() => addToCart(p.id, 1)}>Add to Cart</button>
          </div>
        </div>
      ))}
    </div>
  );
}
