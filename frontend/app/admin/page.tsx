"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface AdminStats {
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    pending: number;
  };
  customers: number;
  products: {
    total: number;
    out_of_stock: number;
    low_stock: number;
  };
  top_products: { name: string; total_sold: number; revenue: number }[];
  low_stock_alerts: { id: number; name: string; stock: number }[];
  recent_orders: {
    id: number;
    order_number: string;
    customer_email: string;
    status: string;
    total_amount: number;
    created_at: string;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#60a5fa",
  processing: "#a78bfa",
  shipped: "#38bdf8",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) { router.push("/"); return; }
    api.admin.stats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest mb-2" style={{ color: "var(--gold)" }}>PAF STORE</p>
            <h1 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--text-primary)" }}>ADMIN DASHBOARD</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/admin/orders" className="px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider transition-colors hover:bg-white/5 text-center"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Manage Orders
            </Link>
            <Link href="/admin/products" className="btn-gold px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider text-center">
              Manage Products
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height: 120 }} />
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "TOTAL ORDERS", value: stats.orders.total, icon: "📦", color: "#60a5fa" },
                { label: "TOTAL REVENUE", value: `PKR ${Number(stats.revenue.total).toLocaleString()}`, icon: "💰", color: "var(--gold)" },
                { label: "CUSTOMERS", value: stats.customers, icon: "👥", color: "#a78bfa" },
                { label: "PRODUCTS", value: stats.products.total, icon: "✈", color: "#22c55e" },
              ].map(card => (
                <div key={card.label} className="card rounded-2xl p-6">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <div className="text-2xl font-black mb-1" style={{ color: card.color }}>{card.value}</div>
                  <div className="text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Orders by status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>ORDERS BY STATUS</h3>
                <div className="space-y-3">
                  {Object.entries(stats.orders).filter(([k]) => k !== "total").map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: statusColors[status] || "var(--text-muted)" }} />
                        <span className="text-sm capitalize" style={{ color: "var(--text-muted)" }}>{status}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>REVENUE OVERVIEW</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>TOTAL REVENUE</div>
                    <div className="text-3xl font-black text-gold-gradient">PKR {Number(stats.revenue.total).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>PENDING PAYMENT</div>
                    <div className="text-xl font-bold" style={{ color: "#f59e0b" }}>PKR {Number(stats.revenue.pending).toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 rounded-xl" style={{ background: "#ef444420" }}>
                      <div className="text-lg font-black" style={{ color: "#ef4444" }}>{stats.products.out_of_stock}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Out of Stock</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: "#f59e0b20" }}>
                      <div className="text-lg font-black" style={{ color: "#f59e0b" }}>{stats.products.low_stock}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Low Stock</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: "#22c55e20" }}>
                      <div className="text-lg font-black" style={{ color: "#22c55e" }}>
                        {stats.products.total - stats.products.out_of_stock - stats.products.low_stock}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Healthy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent orders & Top products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold tracking-widest" style={{ color: "var(--gold)" }}>RECENT ORDERS</h3>
                  <Link href="/admin/orders" className="text-xs tracking-wider hover:text-yellow-400 transition-colors" style={{ color: "var(--text-muted)" }}>
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {stats.recent_orders.map(order => (
                    <div key={order.id} className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>#{order.order_number || order.id}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{order.customer_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: statusColors[order.status] || "var(--text-muted)" }}>
                          {order.status}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>PKR {Number(order.total_amount).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>TOP SELLING PRODUCTS</h3>
                {stats.top_products.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sales data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.top_products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: i === 0 ? "var(--gold)" : "var(--bg-card)", color: i === 0 ? "#0a0e1a" : "var(--text-muted)" }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.total_sold} sold</p>
                        </div>
                        <p className="text-sm font-bold text-gold-gradient shrink-0">PKR {Number(p.revenue).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Low stock alerts */}
            {stats.low_stock_alerts.length > 0 && (
              <div className="card rounded-2xl p-6" style={{ borderColor: "#f59e0b40" }}>
                <h3 className="text-xs font-bold tracking-widest mb-4" style={{ color: "#f59e0b" }}>⚠ LOW STOCK ALERTS</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {stats.low_stock_alerts.map(p => (
                    <Link key={p.id} href={`/admin/products/${p.id}`}
                      className="p-3 rounded-xl text-center transition-colors hover:bg-white/5"
                      style={{ background: "#f59e0b10", border: "1px solid #f59e0b30" }}>
                      <div className="text-xl font-black" style={{ color: "#f59e0b" }}>{p.stock}</div>
                      <div className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>{p.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>Failed to load stats.</p>
        )}
      </div>
    </div>
  );
}
