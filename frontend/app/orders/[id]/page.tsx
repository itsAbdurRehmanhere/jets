"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api, Order } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#f59e0b20", color: "#f59e0b" },
  confirmed:  { bg: "#3b82f620", color: "#60a5fa" },
  processing: { bg: "#8b5cf620", color: "#a78bfa" },
  shipped:    { bg: "#0ea5e920", color: "#38bdf8" },
  delivered:  { bg: "#22c55e20", color: "#22c55e" },
  cancelled:  { bg: "#ef444420", color: "#ef4444" },
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    api.orders.get(Number(id))
      .then(setOrder)
      .catch(() => router.push("/orders"))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
          {[200, 120, 300].map((h, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height: h }} />
          ))}
        </div>
      </div>
    );
  }

  if (!order) return null;

  const sc = statusColors[order.status] || { bg: "#ffffff10", color: "var(--text-muted)" };
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link href="/orders" className="text-xs tracking-widest hover:text-yellow-400 transition-colors mb-4 block"
            style={{ color: "var(--text-muted)" }}>← BACK TO ORDERS</Link>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: "var(--gold)" }}>ORDER DETAILS</p>
              <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                #{order.order_number || order.id}
              </h1>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ml-auto"
              style={{ background: sc.bg, color: sc.color }}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Just placed banner */}
        {justPlaced && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#0d1b2a", border: "1px solid #1e3a5f" }}>
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-black mb-2" style={{ color: "var(--gold)" }}>ORDER PLACED SUCCESSFULLY!</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Our team will contact you on WhatsApp shortly to confirm payment details.
            </p>
          </div>
        )}

        {/* Status tracker */}
        {order.status !== "cancelled" && (
          <div className="card rounded-2xl p-6">
            <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>ORDER STATUS</h3>
            <div className="flex items-center gap-1">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={i <= currentStep
                        ? { background: "var(--gold)", color: "#0a0e1a" }
                        : { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <span className="text-xs mt-1 capitalize hidden sm:block" style={{ color: i <= currentStep ? "var(--gold)" : "var(--text-muted)" }}>
                      {step}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className="flex-1 h-px mx-1" style={{ background: i < currentStep ? "var(--gold)" : "var(--border)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>ORDER ITEMS</h3>
          <div className="space-y-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "#0d1117" }}>
                  {item.product?.images?.[0] ? (
                    <Image src={`${apiUrl}${item.product.images[0].url}`} alt={item.product_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl opacity-20">✈</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.product_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-bold text-gold-gradient">
                  PKR {(Number(item.price) * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: "1px", background: "var(--border)", margin: "16px 0" }} />
          <div className="flex justify-between items-center">
            <span className="font-bold tracking-wider" style={{ color: "var(--text-primary)" }}>TOTAL</span>
            <span className="text-2xl font-black text-gold-gradient">PKR {Number(order.total_amount).toLocaleString()}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xs font-bold tracking-widest mb-4" style={{ color: "var(--gold)" }}>SHIPPING DETAILS</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city}, {order.shipping_country}</p>
            <p className="text-xs mt-2">Ordered: {new Date(order.created_at).toLocaleString("en-PK")}</p>
          </div>
        </div>

        {/* WhatsApp */}
        {order.status === "pending" && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#0d1b2a", border: "1px solid #1e3a5f" }}>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Questions about your order? Contact us on WhatsApp.
            </p>
            <a href={`https://wa.me/923001234567?text=Hi, I have a question about order #${order.order_number || order.id}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-wider inline-block">
              💬 WhatsApp Us
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
