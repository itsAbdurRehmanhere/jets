"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, totalPrice, refreshCart } = useCart();

  const [form, setForm] = useState({
    shipping_address: "",
    shipping_city: "",
    shipping_country: "Pakistan",
    phone: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    setError("");
    setLoading(true);
    try {
      const order = await api.orders.checkout({
        shipping_address: form.shipping_address,
        shipping_city: form.shipping_city,
        shipping_country: form.shipping_country,
        notes: form.notes || undefined,
      });
      await refreshCart();
      router.push(`/orders/${order.id}?placed=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Sign In Required</h2>
          <Link href="/auth/login" className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase">LOGIN</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">🛒</div>
          <h2 className="text-2xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Cart is Empty</h2>
          <Link href="/products" className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-xs tracking-widest mb-2" style={{ color: "var(--gold)" }}>PAF STORE</p>
          <h1 className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>CHECKOUT</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>SHIPPING INFORMATION</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>FULL ADDRESS *</label>
                    <input name="shipping_address" required value={form.shipping_address} onChange={handleChange}
                      placeholder="House/Street/Area" className="input-dark" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>CITY *</label>
                      <input name="shipping_city" required value={form.shipping_city} onChange={handleChange}
                        placeholder="Lahore" className="input-dark" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>COUNTRY</label>
                      <input name="shipping_country" value={form.shipping_country} onChange={handleChange}
                        className="input-dark" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>PHONE NUMBER *</label>
                    <input name="phone" required value={form.phone} onChange={handleChange}
                      placeholder="+92 300 1234567" className="input-dark" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>ORDER NOTES (OPTIONAL)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange}
                      placeholder="Any special instructions..."
                      rows={3}
                      className="input-dark resize-none" />
                  </div>
                </div>
              </div>

              {/* How payment works */}
              <div className="rounded-2xl p-6" style={{ background: "#0d1b2a", border: "1px solid #1e3a5f" }}>
                <h3 className="font-bold text-sm tracking-wide mb-3" style={{ color: "var(--gold)" }}>
                  💬 HOW PAYMENT WORKS
                </h3>
                <ol className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <li>1. Place your order by clicking "Place Order" below</li>
                  <li>2. Our team will contact you on WhatsApp within a few hours</li>
                  <li>3. We will share bank account details for payment</li>
                  <li>4. Once payment is confirmed, your order will be processed & shipped</li>
                </ol>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                {loading ? "Placing Order..." : "PLACE ORDER"}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="card rounded-2xl p-6 sticky top-24">
              <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>ORDER SUMMARY</h3>
              <div className="space-y-3 mb-5">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2" style={{ color: "var(--text-muted)" }}>
                      {item.product?.name?.slice(0, 22) || "Item"} × {item.quantity}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>
                      PKR {(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ height: "1px", background: "var(--border)", marginBottom: 16 }} />
              <div className="flex justify-between items-center">
                <span className="font-bold tracking-wider text-sm" style={{ color: "var(--text-primary)" }}>TOTAL</span>
                <span className="text-2xl font-black text-gold-gradient">
                  PKR {totalPrice.toLocaleString()}
                </span>
              </div>
              <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
                Free shipping on orders over PKR 10,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
