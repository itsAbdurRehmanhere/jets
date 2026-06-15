"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api, Order } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
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
        <div className="max-w-3xl mx-auto px-4 py-12">
          <LoadingSkeleton count={3} height={200} />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStep = statusSteps.indexOf(order.status);

  async function handleCancel() {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await api.orders.cancel(Number(id));
      setOrder(o => o ? { ...o, status: "cancelled" } : o);
    } catch {
      alert("Failed to cancel order. Please contact us on WhatsApp.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">
          <Link href="/orders" className="text-xs tracking-widest hover:text-sky-500 transition-colors mb-4 block"
            style={{ color: "var(--text-muted)" }}>← BACK TO ORDERS</Link>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: "var(--gold)" }}>ORDER DETAILS</p>
              <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                #{order.order_number || order.id}
              </h1>
            </div>
            <div className="ml-auto">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {justPlaced && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
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
            <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-1">
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
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ background: "#f1f5f9" }}>
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
          {order.tracking_number && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "var(--gold)" }}>TRACKING NUMBER</p>
              <p className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>{order.tracking_number}</p>
              {(order as typeof order & { tracking_company?: string }).tracking_company && (
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  via {(order as typeof order & { tracking_company?: string }).tracking_company}
                </p>
              )}
            </div>
          )}
        </div>

        {order.status === "pending" && (
          <div className="rounded-2xl p-6" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <p className="text-sm mb-4 text-center" style={{ color: "var(--text-muted)" }}>
              Questions about your order? Contact us on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={`https://wa.me/923207331147?text=Hi, I have a question about order #${order.order_number || order.id}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-wider inline-block">
                💬 WhatsApp Us
              </a>
              <button onClick={handleCancel} disabled={cancelling}
                className="px-8 py-3 rounded-xl font-bold text-sm tracking-wider border transition-colors hover:bg-red-50 disabled:opacity-50"
                style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
