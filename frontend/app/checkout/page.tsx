"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/Alert";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, totalPrice, refreshCart } = useCart();

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_country: "Pakistan",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "easypaisa">("cod");
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api.profile.get().then((p) => {
      setForm((f) => ({
        ...f,
        customer_name: p.username || "",
        customer_email: p.email || "",
        customer_phone: p.phone || "",
        shipping_address: p.address || "",
        shipping_city: p.city || "",
        shipping_country: p.country || "Pakistan",
      }));
    }).catch(() => {
      setForm((f) => ({ ...f, customer_email: "" }));
    });
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push("/auth/login"); return; }
    setError("");
    setLoading(true);
    try {
      const order = await api.orders.checkout({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        shipping_address: form.shipping_address,
        shipping_city: form.shipping_city,
        shipping_country: form.shipping_country,
        notes: form.notes || undefined,
        send_confirmation_email: false,
        payment_method: paymentMethod,
      });
      await refreshCart();

      // EasyPaisa: auto-submit hidden form to redirect browser
      const ep = (order as typeof order & { _easypaisa?: { checkout_url: string; params: Record<string, string> } })._easypaisa;
      if (paymentMethod === "easypaisa" && ep) {
        setRedirecting(true);
        const form_ = document.createElement("form");
        form_.method = "POST";
        form_.action = ep.checkout_url;
        Object.entries(ep.params).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v;
          form_.appendChild(input);
        });
        document.body.appendChild(form_);
        form_.submit();
        return;
      }

      router.push(`/orders/${order.id}?placed=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <AuthGuard message="Please log in to checkout." />;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <EmptyState icon="🛒" title="Cart is Empty" description="Add items before checking out." ctaText="Shop Now" />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <PageHeader title="CHECKOUT" maxWidth="max-w-5xl" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Contact Info */}
              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>CONTACT INFORMATION</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>FULL NAME *</label>
                      <input name="customer_name" required value={form.customer_name} onChange={handleChange}
                        placeholder="Your full name" className="input-dark" />
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>EMAIL *</label>
                      <input name="customer_email" type="email" required value={form.customer_email} onChange={handleChange}
                        placeholder="your@email.com" className="input-dark" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>PHONE NUMBER *</label>
                    <input name="customer_phone" required value={form.customer_phone} onChange={handleChange}
                      placeholder="+92 320 7331147" className="input-dark" />
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>SHIPPING INFORMATION</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>FULL ADDRESS *</label>
                    <input name="shipping_address" required value={form.shipping_address} onChange={handleChange}
                      placeholder="House/Street/Area" className="input-dark" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>ORDER NOTES (OPTIONAL)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange}
                      placeholder="Any special instructions..."
                      rows={3}
                      className="input-dark resize-none" />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>PAYMENT METHOD</h3>
                <div className="space-y-3">
                  {/* COD */}
                  <label className={`flex items-start gap-4 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "cod" ? "ring-2 ring-yellow-400" : ""}`}
                    style={{ border: `1px solid ${paymentMethod === "cod" ? "var(--gold)" : "var(--border)"}`, background: paymentMethod === "cod" ? "var(--gold)08" : "transparent" }}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")} className="mt-1 accent-yellow-500" />
                    <div>
                      <div className="font-bold text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>💬 Cash on Delivery / WhatsApp</div>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        Place order now — our team contacts you on WhatsApp to confirm and share payment details.
                      </p>
                    </div>
                  </label>
                  {/* EasyPaisa */}
                  <label className={`flex items-start gap-4 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "easypaisa" ? "ring-2 ring-green-400" : ""}`}
                    style={{ border: `1px solid ${paymentMethod === "easypaisa" ? "#22c55e" : "var(--border)"}`, background: paymentMethod === "easypaisa" ? "#22c55e08" : "transparent" }}>
                    <input type="radio" name="payment" value="easypaisa" checked={paymentMethod === "easypaisa"}
                      onChange={() => setPaymentMethod("easypaisa")} className="mt-1 accent-green-500" />
                    <div>
                      <div className="font-bold text-sm tracking-wide flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <span className="text-green-600 font-black">EP</span> EasyPaisa
                      </div>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        Pay instantly via EasyPaisa mobile account, debit card, or EasyPaisa app. You will be redirected to the secure EasyPaisa payment page.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <ErrorAlert message={error} />

              <button type="submit" disabled={loading || redirecting}
                className="btn-gold w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                {redirecting
                  ? "Redirecting to EasyPaisa..."
                  : loading
                  ? "Placing Order..."
                  : paymentMethod === "easypaisa"
                  ? "PLACE ORDER & PAY WITH EASYPAISA"
                  : "PLACE ORDER"}
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
                    <span className="line-clamp-1 mr-2" style={{ color: "var(--text-muted)" }}>
                      {item.product?.name || "Item"} × {item.quantity}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>
                      PKR {(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ height: "1px", background: "var(--border)", marginBottom: 16 }} />
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>PKR {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Shipping</span>
                <span className="text-sm font-semibold" style={{ color: totalPrice >= 5000 ? "#22c55e" : "var(--text-primary)" }}>
                  {totalPrice >= 5000 ? "FREE" : "Calculated at delivery"}
                </span>
              </div>
              <div style={{ height: "1px", background: "var(--border)", marginBottom: 16 }} />
              <div className="flex justify-between items-center">
                <span className="font-bold tracking-wider text-sm" style={{ color: "var(--text-primary)" }}>TOTAL</span>
                <span className="text-2xl font-black text-gold-gradient">
                  PKR {totalPrice.toLocaleString()}
                </span>
              </div>
              {totalPrice < 5000 && (
                <p className="text-xs mt-4 text-center" style={{ color: "var(--gold)" }}>
                  Add PKR {(5000 - totalPrice).toLocaleString()} more for free delivery!
                </p>
              )}
              {totalPrice >= 5000 && (
                <p className="text-xs mt-4 text-center" style={{ color: "#22c55e" }}>
                  ✓ You qualify for free delivery!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
