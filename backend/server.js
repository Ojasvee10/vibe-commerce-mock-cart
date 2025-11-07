import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb, getProducts, ensureSeedProducts, getCart, addToCart, removeCartItem, clearCart, getCartTotals } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const USER = "demo"; // mock single user

await initDb();
await ensureSeedProducts();

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get("/api/products", async (req, res, next) => {
  try { res.json(await getProducts()); } catch (e) { next(e); }
});

app.get("/api/cart", async (req, res, next) => {
  try { const items = await getCart(USER); const totals = await getCartTotals(USER); res.json({ items, ...totals }); } catch (e) { next(e); }
});

app.post("/api/cart", async (req, res, next) => {
  try {
    const { productId, qty } = req.body || {};
    if (!productId || typeof qty !== "number") return res.status(400).json({ error: "productId and qty (number) are required" });
    await addToCart(USER, productId, qty);
    const items = await getCart(USER); const totals = await getCartTotals(USER);
    res.status(201).json({ items, ...totals });
  } catch (e) { next(e); }
});

app.delete("/api/cart/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id" });
    await removeCartItem(USER, id);
    const items = await getCart(USER); const totals = await getCartTotals(USER);
    res.json({ items, ...totals });
  } catch (e) { next(e); }
});

app.post("/api/checkout", async (req, res, next) => {
  try {
    const items = await getCart(USER); const totals = await getCartTotals(USER);
    const timestamp = new Date().toISOString();
    const receipt = { id: Math.random().toString(36).slice(2, 10), items, ...totals, timestamp };
    await clearCart(USER);
    res.json(receipt);
  } catch (e) { next(e); }
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: "Internal server error" }); });

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
