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
    "Jet Models": "✈",
    "Sculptures": "🦅",
    "Trophies": "🏆",
    "Shields": "🛡",
  };

  const fallbackCategories = [
    { id: 1, name: "JET MODELS", icon: "✈", desc: "F-16, JF-17, J-10 replicas" },
    { id: 2, name: "SCULPTURES", icon: "🦅", desc: "Crystal, silver & bronze art" },
    { id: 3, name: "TROPHIES", icon: "🏆", desc: "Award trophies & plaques" },
    { id: 4, name: "ACCESSORIES", icon: "🎖", desc: "Keychains, wallets & more" },
  ];

  return (
    <div style={{ background: "var(--bg-primary)" }}>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, #050810 0%, #0a0e1a 40%, #0d1520 70%, #050810 100%)"
        }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, #c9a84c22 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #1e3a5f33 0%, transparent 50%)`
        }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs tracking-widest font-medium"
            style={{ background: "#c9a84c15", border: "1px solid #c9a84c40", color: "var(--gold)" }}>
            <span>★</span> OFFICIAL PAF COLLECTIBLES STORE <span>★</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
            style={{ lineHeight: 1.05 }}>
            <span style={{ color: "var(--text-primary)" }}>ELITE</span>
            <br />
            <span className="text-gold-gradient">AIR FORCE</span>
            <br />
            <span style={{ color: "var(--text-primary)" }}>COLLECTIBLES</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--text-muted)" }}>
            Handcrafted fighter jet models, precision sculptures, and prestigious trophies.
            Authentic PAF memorabilia for aviation enthusiasts and proud patriots.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="btn-gold px-10 py-4 rounded-xl text-base font-bold tracking-widest uppercase">
              Shop Collection
            </Link>
            <Link href="/products?category_id=1"
              className="px-10 py-4 rounded-xl text-base font-semibold tracking-wider uppercase border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Jet Models ✈
            </Link>
          </div>

          <div className="flex items-center justify-center gap-12 mt-20">
            {[
              { val: "100+", label: "Products" },
              { val: "500+", label: "Happy Customers" },
              { val: "5★", label: "Quality Rated" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-gold-gradient">{s.val}</div>
                <div className="text-xs tracking-widest mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-px h-12 animate-pulse" style={{ background: "linear-gradient(to bottom, var(--gold), transparent)" }} />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs tracking-widest mb-3" style={{ color: "var(--gold)" }}>BROWSE BY CATEGORY</p>
          <h2 className="text-4xl md:text-5xl font-black" style={{ color: "var(--text-primary)" }}>OUR COLLECTIONS</h2>
          <div className="divider-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories.length > 0 ? categories : fallbackCategories).map((cat, i) => (
            <Link key={cat.id}
              href={`/products?category_id=${cat.id}`}
              className="card group relative overflow-hidden rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(135deg, #c9a84c08, transparent)" }} />
              <div className="text-5xl mb-4">{categoryIcons[cat.name] || fallbackCategories[i % 4]?.icon || "✦"}</div>
              <h3 className="font-bold tracking-wider uppercase text-sm" style={{ color: "var(--text-primary)" }}>
                {cat.name}
              </h3>
              {"description" in cat && cat.description && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {cat.description as string}
                </p>
              )}
              {"desc" in cat && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {(cat as { desc: string }).desc}
                </p>
              )}
              <div className="mt-4 text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--gold)" }}>SHOP NOW →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-xs tracking-widest mb-3" style={{ color: "var(--gold)" }}>HANDPICKED FOR YOU</p>
              <h2 className="text-4xl md:text-5xl font-black" style={{ color: "var(--text-primary)" }}>FEATURED PIECES</h2>
              <div className="divider-gold mt-4" />
            </div>
            <Link href="/products" className="hidden md:block text-sm tracking-widest transition-colors hover:text-yellow-400"
              style={{ color: "var(--text-muted)" }}>VIEW ALL →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(product => (
              <Link key={product.id} href={`/products/${product.id}`}
                className="card group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
                <div className="relative aspect-square overflow-hidden" style={{ background: "#0d1117" }}>
                  {product.images?.[0] ? (
                    <Image src={`http://localhost:8000${product.images[0].url}`} alt={product.name}
                      fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">✈</div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
                      style={{ background: "#ef4444", color: "white" }}>SOLD OUT</div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
                      style={{ background: "var(--gold)", color: "#0a0e1a" }}>LOW STOCK</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-sm tracking-wide mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>
                    {product.name}
                  </h3>
                  {product.size && <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Size: {product.size}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-black text-gold-gradient">PKR {Number(product.price).toLocaleString()}</span>
                    <span className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "#c9a84c15", color: "var(--gold)", border: "1px solid #c9a84c30" }}>
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products" className="btn-gold px-12 py-4 rounded-xl text-sm font-bold tracking-widest uppercase inline-block">
              VIEW FULL COLLECTION
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs tracking-widest mb-3" style={{ color: "var(--gold)" }}>WHY CHOOSE US</p>
          <h2 className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>THE PAF STORE PROMISE</h2>
          <div className="divider-gold mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🎖", title: "AUTHENTICITY", desc: "Every piece is handcrafted with precision, capturing the spirit and detail of PAF aviation heritage." },
            { icon: "✈", title: "PREMIUM QUALITY", desc: "From crystal sculptures to die-cast jet models — only the finest materials and craftsmanship." },
            { icon: "📦", title: "SECURE DELIVERY", desc: "All items carefully packaged and shipped with tracking across Pakistan. Free shipping over PKR 10,000." },
          ].map(f => (
            <div key={f.title} className="card rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold tracking-widest text-sm mb-3" style={{ color: "var(--gold)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: "#0d1117" }}>
        <div className="absolute inset-0 opacity-10" style={{
          background: "radial-gradient(ellipse at center, #c9a84c40, transparent 70%)"
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">💬</div>
          <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gold)" }}>ORDER VIA WHATSAPP</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: "var(--text-primary)" }}>
            CUSTOM ORDERS WELCOME
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Looking for a specific jet model, custom trophy, or engraved shield?
            Contact us on WhatsApp for custom orders and bulk pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
              className="btn-gold px-10 py-4 rounded-xl text-base font-bold tracking-wider inline-flex items-center justify-center gap-2">
              💬 Chat on WhatsApp
            </a>
            <Link href="/products"
              className="px-10 py-4 rounded-xl text-base font-semibold border transition-colors hover:bg-white/5 inline-flex items-center justify-center gap-2"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
