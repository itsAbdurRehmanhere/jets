"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api, Product, Category } from "@/lib/api";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.products.list({ limit: 6 }).then(r => setFeatured(r.products)).catch(() => {});
    api.categories.list().then(setCategories).catch(() => {});
  }, []);

  const categoryIcons: Record<string, string> = {
    "Jet Models": "✈", "Sculptures": "🦅", "Trophies": "🏆", "Shields": "🛡",
  };

  const fallbackCategories = [
    { id: 1, name: "JET MODELS", icon: "✈", desc: "F-16, JF-17, J-10 replicas" },
    { id: 2, name: "SCULPTURES", icon: "🦅", desc: "Crystal, silver & bronze art" },
    { id: 3, name: "TROPHIES", icon: "🏆", desc: "Award trophies & plaques" },
    { id: 4, name: "ACCESSORIES", icon: "🎖", desc: "Keychains, wallets & more" },
  ];

  return (
    <div style={{ background: "#0a0e1a" }}>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/hero-jets.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(5,8,16,0.40) 0%, rgba(5,8,16,0.60) 60%, rgba(5,8,16,0.96) 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 70%, rgba(201,168,76,0.10) 0%, transparent 60%)"
        }} />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-32 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs tracking-widest font-semibold"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)", color: "#c9a84c" }}>
            ★ &nbsp;OFFICIAL PAF COLLECTIBLES STORE&nbsp; ★
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight" style={{ lineHeight: 1.05, color: "#f1f5f9" }}>
            ELITE{" "}
            <span style={{ background: "linear-gradient(135deg,#e2c97e,#c9a84c,#a07c2d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              AIR FORCE
            </span>
            <br />COLLECTIBLES
          </h1>

          <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: "#94a3b8" }}>
            Handcrafted fighter jet models, precision sculptures, and prestigious trophies —
            authentic PAF memorabilia for aviation enthusiasts.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <Link href="/products"
              className="btn-gold px-10 py-4 rounded-xl text-sm font-bold tracking-widest uppercase text-center">
              Shop Collection
            </Link>
            <Link href="/products?category_id=1"
              className="px-10 py-4 rounded-xl text-sm font-semibold tracking-wider uppercase border transition-colors hover:bg-white/5 text-center"
              style={{ borderColor: "#1e2d45", color: "#94a3b8" }}>
              Jet Models ✈
            </Link>
          </div>

          <div className="flex items-center justify-center gap-10 sm:gap-16 pt-6 w-full max-w-sm sm:max-w-md"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[{ val: "100+", label: "Products" }, { val: "500+", label: "Customers" }, { val: "5★", label: "Rated" }].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black" style={{ background: "linear-gradient(135deg,#e2c97e,#c9a84c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.val}</div>
                <div className="text-xs tracking-widest mt-1" style={{ color: "#94a3b8" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-10 animate-pulse" style={{ background: "linear-gradient(to bottom,#c9a84c,transparent)" }} />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ background: "#0a0e1a" }} className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "#c9a84c" }}>Browse by Category</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "#f1f5f9" }}>OUR COLLECTIONS</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {(categories.length > 0 ? categories : fallbackCategories).map((cat, i) => (
              <Link key={cat.id} href={`/products?category_id=${cat.id}`}
                className="card group relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
                style={{ background: "#141b2d" }}>
                <div className="text-4xl md:text-5xl mb-3">{categoryIcons[cat.name] || fallbackCategories[i % 4]?.icon || "✦"}</div>
                <h3 className="font-bold tracking-wider uppercase text-xs md:text-sm" style={{ color: "#f1f5f9" }}>{cat.name}</h3>
                {"desc" in cat && (
                  <p className="text-xs mt-2 leading-relaxed hidden sm:block" style={{ color: "#94a3b8" }}>
                    {(cat as { desc: string }).desc}
                  </p>
                )}
                {"description" in cat && (cat as Category).description && (
                  <p className="text-xs mt-2 leading-relaxed hidden sm:block" style={{ color: "#94a3b8" }}>
                    {(cat as Category).description}
                  </p>
                )}
                <div className="mt-3 text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#c9a84c" }}>SHOP NOW →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ background: "#111827" }} className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-12">
            <div>
              <p className="text-xs tracking-widest mb-2 uppercase" style={{ color: "#c9a84c" }}>Handpicked for You</p>
              <h2 className="text-3xl md:text-5xl font-black" style={{ color: "#f1f5f9" }}>FEATURED PIECES</h2>
              <div className="divider-gold mt-4" />
            </div>
            <Link href="/products" className="text-xs tracking-widest transition-colors hover:text-yellow-400 self-start sm:self-end pb-1"
              style={{ color: "#94a3b8" }}>VIEW ALL →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featured.map(product => (
              <Link key={product.id} href={`/products/${product.id}`}
                className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 flex flex-col"
                style={{ background: "#141b2d", border: "1px solid #1e2d45" }}>
                <div className="relative aspect-square overflow-hidden" style={{ background: "#0d1117" }}>
                  {product.images?.[0] ? (
                    <Image src={`http://localhost:8000${product.images[0].url}`}
                      alt={product.name || "Product"} fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl" style={{ color: "#1e2d45" }}>✈</div>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold" style={{ background: "#ef4444", color: "white" }}>SOLD OUT</span>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold" style={{ background: "#c9a84c", color: "#0a0e1a" }}>LOW STOCK</span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm tracking-wide line-clamp-2 flex-1" style={{ color: "#f1f5f9" }}>{product.name}</h3>
                  {product.size && <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Size: {product.size}</p>}
                  <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid #1e2d45" }}>
                    <span className="text-base font-black" style={{ background: "linear-gradient(135deg,#e2c97e,#c9a84c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      PKR {Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.25)" }}>View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products" className="btn-gold inline-block px-12 py-4 rounded-xl text-sm font-bold tracking-widest uppercase">
              VIEW FULL COLLECTION
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ background: "#0a0e1a" }} className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "#c9a84c" }}>Why Choose Us</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "#f1f5f9" }}>THE PAF STORE PROMISE</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "🎖", title: "AUTHENTICITY", desc: "Every piece is handcrafted with precision, capturing the spirit and detail of PAF aviation heritage." },
              { icon: "✈", title: "PREMIUM QUALITY", desc: "From crystal sculptures to die-cast jet models — only the finest materials and craftsmanship." },
              { icon: "📦", title: "SECURE DELIVERY", desc: "All items carefully packaged and shipped with tracking across Pakistan. Free shipping over PKR 10,000." },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-8 flex flex-col items-center text-center"
                style={{ background: "#141b2d", border: "1px solid #1e2d45" }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold tracking-widest text-sm mb-3" style={{ color: "#c9a84c" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHATSAPP CTA ── */}
      <section style={{ background: "#0d1117" }} className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 70%)"
        }} />
        <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center text-center gap-5">
          <div className="text-5xl">💬</div>
          <p className="text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>Order via WhatsApp</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black" style={{ color: "#f1f5f9" }}>CUSTOM ORDERS WELCOME</h2>
          <p className="text-base leading-relaxed" style={{ color: "#94a3b8" }}>
            Looking for a specific jet model, custom trophy, or engraved shield?
            Contact us on WhatsApp for custom orders and bulk pricing.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
              className="btn-gold px-10 py-4 rounded-xl text-sm font-bold tracking-wider inline-flex items-center justify-center gap-2">
              💬 Chat on WhatsApp
            </a>
            <Link href="/products"
              className="px-10 py-4 rounded-xl text-sm font-semibold border transition-colors hover:bg-white/5 inline-flex items-center justify-center gap-2"
              style={{ borderColor: "#1e2d45", color: "#94a3b8" }}>
              Browse Collection
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
