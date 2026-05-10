"use client";
import { useState } from "react";
import AddToCartButton from "./AddToCartButton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  apparel: "👕",
  accessories: "🎽",
  home: "🏡",
};

export default function MerchGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState("all");

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const visible = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className="px-5 py-2 rounded-full text-sm font-bold capitalize transition-colors"
            style={
              active === cat
                ? { background: "#3C3B6E", color: "#fff" }
                : { background: "#f0f4ff", color: "#3C3B6E" }
            }
          >
            {cat === "all" ? "All Products" : `${CATEGORY_EMOJIS[cat] ?? "📦"} ${cat}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visible.map((product) => {
          const freeTickets = Math.floor(product.price / 25);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div
                className="h-48 flex items-center justify-center text-6xl"
                style={{ background: "#f0f4ff" }}
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{CATEGORY_EMOJIS[product.category] ?? "📦"}</span>
                )}
              </div>
              <div className="p-5">
                {freeTickets > 0 && (
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                    🎟️ +{freeTickets} Free Ticket{freeTickets > 1 ? "s" : ""}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black" style={{ color: "#B22234" }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} />
                </div>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="col-span-4 py-16 text-center text-gray-400 font-semibold">
            No products in this category.
          </div>
        )}
      </div>
    </>
  );
}
