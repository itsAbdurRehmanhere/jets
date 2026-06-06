"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    api.orders.myOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-xs tracking-widest mb-2" style={{ color: "var(--gold)" }}>PAF STORE</p>
          <h1 className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>MY ORDERS</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height: 100 }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4 opacity-20">📦</div>
            <h2 className="text-2xl font-black mb-3" style={{ color: "var(--text-primary)" }}>No Orders Yet</h2>
            <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>Start shopping to see your orders here</p>
            <Link href="/products" className="btn-gold px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const sc = statusColors[order.status] || { bg: "#ffffff10", color: "var(--text-muted)" };
              return (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-yellow-500/30 transition-all block">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm tracking-wider" style={{ color: "var(--text-primary)" }}>
                        #{order.order_number || order.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase"
                        style={{ background: sc.bg, color: sc.color }}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(order.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
                      {" · "}{order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-gold-gradient">
                      PKR {Number(order.total_amount).toLocaleString()}
                    </div>
                    <div className="text-xs mt-1 tracking-wider" style={{ color: "var(--gold)" }}>View Details →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
