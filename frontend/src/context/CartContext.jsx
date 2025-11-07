import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete } from "../api.js";
import toast from "react-hot-toast";

const CartCtx = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet("/api/cart");
      setCart(data.items || []);
      setSubtotal(Number(data.subtotal || 0));
      setDiscount(Number(data.discount || 0));
      setTotal(Number(data.total || 0));
      setError("");
    } catch (e) {
      setError("Failed to load cart.");
      toast.error("Failed to load cart");
    }
  }, []);

  useEffect(() => { (async () => { setLoading(true); await refresh(); setLoading(false); })(); }, [refresh]);

  const addToCart = async (productId, qty) => {
    try { await apiPost("/api/cart", { productId, qty }); toast.success(qty > 0 ? "Added to cart" : "Removed from cart"); await refresh(); }
    catch { toast.error("Update failed"); }
  };

  const removeItem = async (cartId) => {
    try { await apiDelete(`/api/cart/${cartId}`); toast.success("Item removed"); await refresh(); }
    catch { toast.error("Remove failed"); }
  };

  const value = { cart, subtotal, discount, total, loading, error, refresh, addToCart, removeItem };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() { return useContext(CartCtx); }
