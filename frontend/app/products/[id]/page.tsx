"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api, Product, ProductImage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.products.get(Number(id))
      .then((p) => {
        setProduct(p);
        const primary = p.images?.find(img => img.is_primary) ?? p.images?.[0];
        setSelectedImage(primary ?? null);
      })
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user) { router.push("/auth/login"); return; }
    setAdding(true);
    try {
      await addToCart(product!.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height: 480 }} />
            <div className="space-y-4">
              {[180, 80, 120, 60, 200].map((h, i) => (
                <div key={i} className="rounded-xl animate-pulse" style={{ background: "var(--bg-card)", height: h }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-wider mb-8" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:text-yellow-400 transition-colors">HOME</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-yellow-400 transition-colors">PRODUCTS</Link>
          <span>›</span>
          <span style={{ color: "var(--gold)" }}>{product.name.toUpperCase()}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden" style={{ height: 480, background: "#0d1117" }}>
              {selectedImage ? (
                <Image src={`${apiUrl}${selectedImage.url}`} alt={product.name || "Product image"}
                  fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">✈</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map(img => (
                  <button key={img.id} onClick={() => setSelectedImage(img)}
                    className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden transition-all"
                    style={{
                      border: selectedImage?.id === img.id ? "2px solid var(--gold)" : "2px solid var(--border)",
                      background: "#0d1117"
                    }}>
                    <Image src={`${apiUrl}${img.url}`} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-wide mb-3" style={{ color: "var(--text-primary)" }}>
                {product.name}
              </h1>
              {product.size && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wider"
                  style={{ background: "#c9a84c15", color: "var(--gold)", border: "1px solid #c9a84c30" }}>
                  SIZE: {product.size}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-5xl font-black text-gold-gradient">
              PKR {Number(product.price).toLocaleString()}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full inline-block`}
                style={{ background: inStock ? "#22c55e" : "#ef4444" }} />
              <span className="text-sm font-medium tracking-wide"
                style={{ color: inStock ? "#22c55e" : "#ef4444" }}>
                {inStock ? (lowStock ? `Only ${product.stock} left — order soon` : "In Stock") : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {product.description}
              </p>
            )}

            {/* Quantity + Add to Cart */}
            {inStock && (
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-3 transition-colors hover:bg-white/5 text-lg font-bold"
                    style={{ color: "var(--text-muted)" }}>−</button>
                  <span className="px-5 py-3 text-sm font-bold min-w-[3rem] text-center"
                    style={{ color: "var(--text-primary)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-3 transition-colors hover:bg-white/5 text-lg font-bold"
                    style={{ color: "var(--text-muted)" }}>+</button>
                </div>

                <button onClick={handleAddToCart} disabled={adding || added}
                  className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-60"
                  style={added
                    ? { background: "#22c55e", color: "white" }
                    : { background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
                  {adding ? "Adding..." : added ? "✓ Added to Cart" : "Add to Cart"}
                </button>
              </div>
            )}

            {/* Go to cart */}
            {inStock && (
              <Link href="/cart"
                className="w-full text-center py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-colors hover:bg-white/5"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                View Cart & Checkout
              </Link>
            )}

            {/* How it works */}
            <div className="rounded-xl p-5" style={{ background: "#0d1b2a", border: "1px solid #1e3a5f" }}>
              <p className="font-bold text-sm mb-2 tracking-wide" style={{ color: "var(--gold)" }}>
                HOW ORDERING WORKS
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Place your order on the website — we will contact you on WhatsApp to confirm and
                share payment details. Payment is required upfront to process your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
