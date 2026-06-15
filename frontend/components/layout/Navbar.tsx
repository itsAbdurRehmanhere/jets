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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const navLinks = [
    { label: "PRODUCTS", href: "/products" },
    { label: "JET MODELS", href: "/products?category_id=1" },
    { label: "SCULPTURES", href: "/products?category_id=2" },
    { label: "TROPHIES", href: "/products?category_id=3" },
    { label: "ACCESSORIES", href: "/products?category_id=4" },
    { label: "ABOUT", href: "/about" },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {/* Announcement bar */}
      <div className="hidden md:block text-xs text-center py-1.5"
        style={{ background: "linear-gradient(135deg, var(--gold-dark), var(--gold-light))", borderBottom: "1px solid var(--border-gold)" }}>
        <span style={{ color: "#ffffff", letterSpacing: "0.1em", fontWeight: 700 }}>
          ✈ FREE SHIPPING ON ORDERS OVER PKR 5,000 &nbsp;|&nbsp; ORDER VIA WHATSAPP: +92 320 7331147
        </span>
      </div>

      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-black"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
            ✈
          </div>
          <div className="leading-tight">
            <div className="font-black text-sm tracking-widest" style={{ color: "var(--text-primary)" }}>PAF STORE</div>
            <div className="text-xs tracking-widest hidden sm:block" style={{ color: "var(--gold)", fontSize: "0.6rem" }}>COLLECTIBLES</div>
          </div>
        </Link>

        {/* Desktop nav — centred */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold tracking-widest flex-1 justify-center">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="transition-colors hover:text-sky-500 whitespace-nowrap"
              style={{ color: "var(--text-muted)" }}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="transition-colors hover:text-sky-400 whitespace-nowrap"
              style={{ color: "var(--gold)" }}>
              ADMIN
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-lg transition-colors hover:bg-black/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: "var(--text-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13H5.4M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-black"
                style={{ background: "var(--gold)", color: "#0a0e1a" }}>
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-black/5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block text-xs tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {user.username}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-1 z-50"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <Link href="/orders" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                    style={{ color: "var(--text-muted)" }}>
                    📦 My Orders
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                    style={{ color: "var(--text-muted)" }}>
                    👤 Profile
                  </Link>
                  <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
                    style={{ color: "#ef4444" }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login"
              className="btn-gold hidden sm:block px-5 py-2 rounded-lg text-xs font-bold tracking-widest uppercase">
              LOGIN
            </Link>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg transition-colors hover:bg-black/5"
            onClick={() => setMobileOpen(o => !o)}
            style={{ color: "var(--text-muted)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-1"
          style={{ borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.98)" }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm tracking-widest font-medium transition-colors hover:bg-sky-50"
              style={{ color: "var(--text-muted)" }}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm tracking-widest font-medium transition-colors hover:bg-black/5"
              style={{ color: "var(--gold)" }}>
              ADMIN
            </Link>
          )}
          {!user && (
            <Link href="/auth/login" onClick={() => setMobileOpen(false)}
              className="btn-gold flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase mt-2">
              LOGIN
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
