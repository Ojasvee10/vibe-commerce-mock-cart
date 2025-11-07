import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "data.db");

let db;

export async function initDb() {
  sqlite3.verbose();
  await new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => err ? reject(err) : resolve());
  });

  await run(`PRAGMA foreign_keys = ON;`);

  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT
  );`);

  await run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    productId INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    FOREIGN KEY(productId) REFERENCES products(id)
  );`);
}

export async function ensureSeedProducts() {
  const rows = await all(`SELECT COUNT(1) as c FROM products;`);
  if (rows[0].c > 0) return;

  const seed = [
    { id: 1, name: "Classic Tee", price: 499.0, image: "https://picsum.photos/seed/tee/300/200" },
    { id: 2, name: "Denim Jeans", price: 1299.0, image: "https://picsum.photos/seed/jeans/300/200" },
    { id: 3, name: "Sneakers", price: 1999.0, image: "https://picsum.photos/seed/sneakers/300/200" },
    { id: 4, name: "Backpack", price: 899.0, image: "https://picsum.photos/seed/bag/300/200" },
    { id: 5, name: "Sunglasses", price: 699.0, image: "https://picsum.photos/seed/shades/300/200" },
    { id: 6, name: "Analog Watch", price: 1599.0, image: "https://picsum.photos/seed/watch/300/200" },
    { id: 7, name: "Wireless Earbuds", price: 1499.0, image: "https://picsum.photos/seed/buds/300/200" },
    { id: 8, name: "Hoodie", price: 1199.0, image: "https://picsum.photos/seed/hoodie/300/200" }
  ];

  const stmt = await prepare(`INSERT INTO products (id, name, price, image) VALUES (?, ?, ?, ?);`);
  for (const p of seed) {
    await runStmt(stmt, [p.id, p.name, p.price, p.image]);
  }
  await finalize(stmt);
}

export async function getProducts() {
  return await all(`SELECT id, name, price, image FROM products ORDER BY id;`);
}

export async function getCart(user) {
  return await all(
    `SELECT c.id as cartId, c.productId, c.qty, p.name, p.price, p.image
     FROM cart c JOIN products p ON p.id = c.productId
     WHERE c.user = ? ORDER BY c.id;`,
    [user]
  );
}

export async function getCartTotals(user) {
  const rows = await all(
    `SELECT SUM(c.qty * p.price) AS subtotal
     FROM cart c JOIN products p ON p.id = c.productId
     WHERE c.user = ?;`,
    [user]
  );
  const subtotal = Number(rows[0].subtotal || 0);
  const discount = subtotal > 3000 ? +(subtotal * 0.10).toFixed(2) : 0;
  const total = +(subtotal - discount).toFixed(2);
  return { subtotal, discount, total };
}

export async function addToCart(user, productId, qty) {
  const existing = await all(
    `SELECT id FROM cart WHERE user = ? AND productId = ?;`,
    [user, productId]
  );
  if (existing.length) {
    const id = existing[0].id;
    if (qty <= 0) await run(`DELETE FROM cart WHERE id = ?;`, [id]);
    else await run(`UPDATE cart SET qty = ? WHERE id = ?;`, [qty, id]);
  } else if (qty > 0) {
    await run(`INSERT INTO cart (user, productId, qty) VALUES (?, ?, ?);`, [user, productId, qty]);
  }
}

export async function removeCartItem(user, cartId) {
  await run(`DELETE FROM cart WHERE id = ? AND user = ?;`, [cartId, user]);
}

export async function clearCart(user) {
  await run(`DELETE FROM cart WHERE user = ?;`, [user]);
}

// sqlite helpers
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { if (err) reject(err); else resolve(this); });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
  });
}
function prepare(sql) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(sql, (err) => (err ? reject(err) : resolve(stmt)));
  });
}
function runStmt(stmt, params=[]) {
  return new Promise((resolve, reject) => {
    stmt.run(params, function(err){ if (err) reject(err); else resolve(this); });
  });
}
function finalize(stmt) {
  return new Promise((resolve, reject) => {
    stmt.finalize((err) => err ? reject(err) : resolve());
  });
}
