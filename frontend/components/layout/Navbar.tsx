"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,14,26,0.97)" : "rgba(10,14,26,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? "#1e2d45" : "transparent"}`,
      }}
    >
      {/* Top bar */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1e2d45" }}
        className="hidden md:block text-xs text-center py-1.5">
        <span style={{ color: "var(--gold)", letterSpacing: "0.1em" }}>
          ✈ FREE SHIPPING ON ORDERS OVER PKR 10,000 &nbsp;|&nbsp; ORDER VIA WHATSAPP: +92-XXX-XXXXXXX
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
            ✈
          </div>
          <div>
            <div className="font-bold text-lg tracking-wider" style={{ color: "var(--text-primary)", lineHeight: 1.1 }}>
              PAF STORE
            </div>
            <div className="text-xs tracking-widest" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              COLLECTIBLES
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <Link href="/products" className="transition-colors hover:text-yellow-400"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            PRODUCTS
          </Link>
          <Link href="/products?category_id=1" className="transition-colors hover:text-yellow-400"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            JET MODELS
          </Link>
          <Link href="/products?category_id=2" className="transition-colors hover:text-yellow-400"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            SCULPTURES
          </Link>
          <Link href="/products?category_id=3" className="transition-colors hover:text-yellow-400"
            style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            TROPHIES
          </Link>
          {isAdmin && (
            <Link href="/admin" className="transition-colors"
              style={{ color: "var(--gold)" }}>
              ADMIN
            </Link>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-lg transition-colors hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: "var(--text-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13H5.4M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: "var(--gold)", color: "#0a0e1a" }}>
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                style={{ color: "var(--text-primary)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block text-sm" style={{ color: "var(--text-muted)" }}>
                  {user.username}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 min-w-[180px] rounded-xl shadow-2xl py-1 z-50"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <Link href="/orders" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: "var(--text-muted)" }}>
                    📦 My Orders
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: "var(--text-muted)" }}>
                    👤 Profile
                  </Link>
                  <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: "#ef4444" }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login"
              className="btn-gold px-5 py-2 rounded-lg text-sm hidden md:block"
              style={{ letterSpacing: "0.06em" }}>
              LOGIN
            </Link>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: "var(--text-muted)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1"
          style={{ borderTop: "1px solid var(--border)" }}>
          {["PRODUCTS", "JET MODELS", "SCULPTURES", "TROPHIES"].map((item, i) => (
            <Link key={i}
              href={i === 0 ? "/products" : `/products?category_id=${i}`}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm tracking-wider transition-colors hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}>
              {item}
            </Link>
          ))}
          {!user && (
            <Link href="/auth/login" onClick={() => setMobileOpen(false)}
              className="btn-gold block text-center px-4 py-3 rounded-lg text-sm mt-2">
              LOGIN
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
