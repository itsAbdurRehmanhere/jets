"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api, API_URL, Product, Category } from "@/lib/api";
import { StockBadge } from "@/components/ui/StockBadge";

// ─────────────────────────────────────────────────────────────────────────────
// HERO BANNER IMAGES
// • To ADD a photo:    copy it to /frontend/public/ and add its filename below
// • To REMOVE a photo: delete the line
// • Minimum: 1 image  |  No maximum (more images = longer before it repeats)
// ─────────────────────────────────────────────────────────────────────────────
const HERO_IMAGES = [
  "/f-16.jpg",
  "/j-10.jpg",
  "/thunder_fleet.jpg",
  "/f-16_fleet.jpg",
];
const SLIDE_INTERVAL_MS = 5000;
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    api.products.list({ limit: 6 }).then(r => setFeatured(r.products)).catch(() => {});
    api.categories.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const categoryIcons: Record<string, string> = {
    "Jet Models": "✈", "Fighter Jets": "✈", "Sculptures": "🦅", "Trophies": "🏆",
    "Shields": "🛡", "Accessories": "🎖", "Apparel": "👕", "Mugs": "☕",
  };

  const fallbackCategories = [
    { id: 1, name: "JET MODELS", icon: "✈", desc: "F-16, JF-17, J-10 replicas" },
    { id: 2, name: "SCULPTURES", icon: "🦅", desc: "Crystal, silver & bronze art" },
    { id: 3, name: "TROPHIES", icon: "🏆", desc: "Award trophies & plaques" },
    { id: 4, name: "ACCESSORIES", icon: "🎖", desc: "Keychains, wallets & more" },
  ];

  return (
    <div style={{ background: "var(--bg-primary)" }}>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "#04182e" }}>

        {/* Crossfading background images */}
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: i === heroIndex ? 1 : 0,
              zIndex: 0,
            }}
          />
        ))}

        {/* Dark sky-blue gradient overlay */}
        <div className="absolute inset-0 z-10" style={{
          background: "linear-gradient(to bottom, rgba(4,24,46,0.30) 0%, rgba(7,89,133,0.45) 60%, rgba(4,24,46,0.92) 100%)"
        }} />
        <div className="absolute inset-0 z-10" style={{
          background: "radial-gradient(ellipse at 30% 70%, rgba(56,189,248,0.10) 0%, transparent 60%)"
        }} />

        {/* Hero content */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-6 py-32 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs tracking-widest font-semibold"
            style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)", color: "#38bdf8" }}>
            ★ &nbsp;OFFICIAL PAF COLLECTIBLES STORE&nbsp; ★
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight" style={{ lineHeight: 1.05, color: "#f0f9ff" }}>
            ELITE{" "}
            <span style={{ background: "linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              AIR FORCE
            </span>
            <br />COLLECTIBLES
          </h1>

          <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: "#bae6fd" }}>
            Handcrafted fighter jet models, precision sculptures, and prestigious trophies —
            authentic PAF memorabilia for aviation enthusiasts.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <Link href="/products"
              className="btn-gold px-10 py-4 rounded-xl text-sm font-bold tracking-widest uppercase text-center">
              Shop Collection
            </Link>
            <Link href="/products?category_id=1"
              className="px-10 py-4 rounded-xl text-sm font-semibold tracking-wider uppercase border transition-colors hover:bg-white/10 text-center"
              style={{ borderColor: "rgba(125,211,252,0.35)", color: "#bae6fd" }}>
              Jet Models ✈
            </Link>
          </div>

          <div className="flex items-center justify-center gap-10 sm:gap-16 pt-6 w-full max-w-sm sm:max-w-md"
            style={{ borderTop: "1px solid rgba(125,211,252,0.15)" }}>
            {[{ val: "100+", label: "Products" }, { val: "500+", label: "Customers" }, { val: "5★", label: "Rated" }].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black" style={{ background: "linear-gradient(135deg,#7dd3fc,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.val}</div>
                <div className="text-xs tracking-widest mt-1" style={{ color: "#94a3b8" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide indicator dots */}
        {HERO_IMAGES.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === heroIndex ? 24 : 8,
                  height: 8,
                  background: i === heroIndex ? "#38bdf8" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="w-px h-8 animate-pulse" style={{ background: "linear-gradient(to bottom,#38bdf8,transparent)" }} />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ background: "var(--bg-secondary)" }} className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--gold)" }}>Browse by Category</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "var(--text-primary)" }}>OUR COLLECTIONS</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(categories.length > 0 ? categories : fallbackCategories).map((cat, i) => (
              <Link key={cat.id} href={`/products?category_id=${cat.id}`}
                className="card group relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl md:text-5xl mb-4">
                  {categoryIcons[cat.name] || fallbackCategories[i % 4]?.icon || "✦"}
                </div>
                <h3 className="font-bold tracking-wider uppercase text-xs md:text-sm mb-2" style={{ color: "var(--text-primary)" }}>{cat.name}</h3>
                {"desc" in cat && (
                  <p className="text-xs leading-relaxed hidden sm:block" style={{ color: "var(--text-muted)" }}>
                    {(cat as { desc: string }).desc}
                  </p>
                )}
                {"description" in cat && (cat as Category).description && (
                  <p className="text-xs leading-relaxed hidden sm:block" style={{ color: "var(--text-muted)" }}>
                    {(cat as Category).description}
                  </p>
                )}
                <div className="mt-4 text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--gold)" }}>SHOP NOW →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ background: "var(--bg-primary)" }} className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--gold)" }}>Handpicked for You</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "var(--text-primary)" }}>FEATURED PIECES</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {featured.map(product => (
              <Link key={product.id} href={`/products/${product.id}`}
                className="card group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-100 flex flex-col">
                <div className="relative aspect-square overflow-hidden" style={{ background: "#f1f5f9" }}>
                  {product.images?.[0] ? (
                    <Image src={`${API_URL}${product.images[0].url}`}
                      alt={product.name || "Product"} fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl" style={{ color: "#e2e8f0" }}>✈</div>
                  )}
                  <StockBadge stock={product.stock} />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm tracking-wide line-clamp-2 flex-1" style={{ color: "var(--text-primary)" }}>{product.name}</h3>
                  {product.size && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Size: {product.size}</p>}
                  <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <span className="text-base font-black text-gold-gradient">
                      PKR {Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: "rgba(2,132,199,0.10)", color: "var(--gold)", border: "1px solid rgba(2,132,199,0.25)" }}>View →</span>
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
      <section style={{ background: "var(--bg-secondary)" }} className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--gold)" }}>Why Choose Us</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "var(--text-primary)" }}>THE PAF STORE PROMISE</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "🎖", title: "AUTHENTICITY", desc: "Every piece is handcrafted with precision, capturing the spirit and detail of PAF aviation heritage." },
              { icon: "✈", title: "PREMIUM QUALITY", desc: "From crystal sculptures to die-cast jet models — only the finest materials and craftsmanship." },
              { icon: "📦", title: "SECURE DELIVERY", desc: "All items carefully packaged and shipped with tracking across Pakistan. Free shipping over PKR 5,000." },
            ].map(f => (
              <div key={f.title} className="card rounded-2xl p-8 flex flex-col items-center text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold tracking-widest text-sm mb-3" style={{ color: "var(--gold)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHATSAPP CTA ── */}
      <section className="py-20 md:py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #e0f2fe 100%)" }}>
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 70%)"
        }} />
        <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center text-center gap-5">
          <div className="text-5xl">💬</div>
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Order via WhatsApp</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black" style={{ color: "var(--text-primary)" }}>CUSTOM ORDERS WELCOME</h2>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Looking for a specific jet model, custom trophy, or engraved shield?
            Contact us on WhatsApp for custom orders and bulk pricing.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <a href="https://wa.me/923207331147" target="_blank" rel="noopener noreferrer"
              className="btn-gold px-10 py-4 rounded-xl text-sm font-bold tracking-wider inline-flex items-center justify-center gap-2">
              💬 Chat on WhatsApp
            </a>
            <Link href="/products"
              className="px-10 py-4 rounded-xl text-sm font-semibold border transition-colors hover:bg-sky-100 inline-flex items-center justify-center gap-2"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Browse Collection
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
