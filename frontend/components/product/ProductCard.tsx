"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  };

  const imgUrl = product.images?.[0]?.url
    ? `http://localhost:8000${product.images[0].url}`
    : null;

  return (
    <div className="card group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 flex flex-col">
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden" style={{ background: "#0d1117" }}>
        {imgUrl ? (
          <Image src={imgUrl} alt={product.name || "Product image"} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl opacity-10">✈</div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}>
          <span className="text-xs tracking-widest font-bold px-4 py-2 rounded-lg"
            style={{ background: "var(--gold)", color: "#0a0e1a" }}>QUICK VIEW</span>
        </div>
        {/* Badges */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold tracking-wide"
            style={{ background: "#ef4444dd", color: "white" }}>SOLD OUT</div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold tracking-wide"
            style={{ background: "var(--gold)", color: "#0a0e1a" }}>
            ONLY {product.stock} LEFT
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm tracking-wide line-clamp-2 hover:text-yellow-400 transition-colors"
            style={{ color: "var(--text-primary)" }}>
            {product.name}
          </h3>
        </Link>

        {product.size && (
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Size: {product.size}</p>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div>
            <div className="text-lg font-black text-gold-gradient">
              PKR {Number(product.price).toLocaleString()}
            </div>
            {product.stock > 0 && (
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>In stock</div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all disabled:opacity-40"
            style={
              added
                ? { background: "#22c55e", color: "white" }
                : product.stock === 0
                ? { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                : { background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }
            }
          >
            {adding ? "..." : added ? "✓ ADDED" : product.stock === 0 ? "SOLD OUT" : "+ CART"}
          </button>
        </div>
      </div>
    </div>
  );
}
