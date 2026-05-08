"use client";
import { useState } from "react";

interface Props {
  product: { id: string; name: string; price: number };
}

export default function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    // Store cart in localStorage for now
    const cart: { id: string; name: string; price: number; qty: number }[] = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className="text-sm font-bold px-4 py-2 rounded-lg text-white transition-colors"
      style={{ background: added ? "#16a34a" : "#3C3B6E" }}
    >
      {added ? "✓ Added!" : "Add to Cart"}
    </button>
  );
}
