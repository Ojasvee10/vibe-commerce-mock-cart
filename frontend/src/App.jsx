import React, { useEffect, useState } from "react";
import { CartProvider } from "./context/CartContext.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import Cart from "./components/Cart.jsx";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [user, setUser] = useState(localStorage.getItem("user") || "");

  useEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      const name = prompt("Welcome! Enter your name to personalize your cart:");
      if (name) {
        localStorage.setItem("user", name);
        setUser(name);
      }
    }
  }, []);

  return (
    <CartProvider>
      <div className="container">
        <header className="header">
          <div className="brand">
            <span className="logo">V</span>
            <div>
              <h1>Vibe Commerce</h1>
              <p className="sub">Mock E-Com Cart • Pro Edition</p>
            </div>
          </div>
          <div className="header-actions">
            {user && <span className="hello">Hi, {user.split(" ")[0]}!</span>}
            <button className="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </header>
        <main className="grid">
          <section>
            <h2>Products</h2>
            <ProductGrid />
          </section>
          <aside>
            <Cart />
          </aside>
        </main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} Vibe Commerce (demo)</span>
        </footer>
      </div>
      <Toaster position="bottom-right" />
    </CartProvider>
  );
}
