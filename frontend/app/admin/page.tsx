"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, AdminStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#a78bfa",
  shipped: "#38bdf8",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

const adminNav = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/product-types", label: "Product Types" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!user.is_admin) { router.push("/"); return; }
    api.admin.stats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user || !user.is_admin) return null;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-4">
            <p className="text-xs tracking-widest mb-2" style={{ color: "var(--gold)" }}>PAF STORE</p>
            <h1 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--text-primary)" }}>ADMIN DASHBOARD</h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {adminNav.map(link => (
              <Link key={link.href} href={link.href}
                className="px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider transition-colors hover:bg-black/5 text-center"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <LoadingSkeleton count={4} height={120} layout="grid-4" />
        ) : stats ? (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "TOTAL ORDERS", value: stats.orders.total, icon: "📦", color: "#60a5fa" },
                { label: "REVENUE COLLECTED", value: `PKR ${Number(stats.revenue.total_paid).toLocaleString()}`, icon: "💰", color: "var(--gold)" },
                { label: "CUSTOMERS", value: stats.users.total_customers, icon: "👥", color: "#a78bfa" },
                { label: "TOTAL PRODUCTS", value: stats.products.total, icon: "✈", color: "#22c55e" },
              ].map(card => (
                <div key={card.label} className="card rounded-2xl p-6">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <div className="text-2xl font-black mb-1" style={{ color: card.color }}>{card.value}</div>
                  <div className="text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Orders by status + Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold tracking-widest" style={{ color: "var(--gold)" }}>ORDERS BY STATUS</h3>
                  <Link href="/admin/orders" className="text-xs tracking-wider hover:text-sky-500 transition-colors" style={{ color: "var(--text-muted)" }}>
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats.orders).filter(([k]) => k !== "total").map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: statusColors[status] || "var(--text-muted)" }} />
                        <span className="text-sm capitalize" style={{ color: "var(--text-muted)" }}>{status}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>REVENUE OVERVIEW</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>COLLECTED (PAID ORDERS)</div>
                    <div className="text-3xl font-black text-gold-gradient">PKR {Number(stats.revenue.total_paid).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>PENDING COLLECTION</div>
                    <div className="text-xl font-bold" style={{ color: "#f59e0b" }}>PKR {Number(stats.revenue.pending_collection).toLocaleString()}</div>
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
                  <Link href="/admin/orders" className="text-xs tracking-wider hover:text-sky-500 transition-colors" style={{ color: "var(--text-muted)" }}>View All →</Link>
                </div>
                <div className="space-y-3">
                  {stats.recent_orders.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No orders yet</p>
                  ) : stats.recent_orders.map(order => (
                    <Link key={order.order_id} href={`/orders/${order.order_id}`}
                      className="flex items-center justify-between py-2 hover:opacity-80 transition-opacity"
                      style={{ borderBottom: "1px solid var(--border)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>#{order.order_number}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize" style={{ color: statusColors[order.order_status] || "var(--text-muted)" }}>
                          {order.order_status}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>PKR {Number(order.total).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="card rounded-2xl p-6">
                <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>TOP SELLING PRODUCTS</h3>
                {stats.top_selling_products.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No sales data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.top_selling_products.map((p, i) => (
                      <div key={p.product_id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: i === 0 ? "var(--gold)" : "var(--bg-card)", color: i === 0 ? "#0a0e1a" : "var(--text-muted)" }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.product_name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.total_sold} sold</p>
                        </div>
                        <p className="text-sm font-bold text-gold-gradient shrink-0">PKR {Number(p.total_revenue).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Low stock alerts */}
            {stats.low_stock_alerts.length > 0 && (
              <div className="card rounded-2xl p-6" style={{ borderColor: "#f59e0b40" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold tracking-widest" style={{ color: "#f59e0b" }}>LOW STOCK ALERTS</h3>
                  <Link href="/admin/products" className="text-xs tracking-wider hover:text-sky-500 transition-colors" style={{ color: "var(--text-muted)" }}>
                    Manage →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {stats.low_stock_alerts.map(p => (
                    <div key={p.product_id} className="p-3 rounded-xl text-center"
                      style={{ background: "#f59e0b10", border: "1px solid #f59e0b30" }}>
                      <div className="text-xl font-black" style={{ color: "#f59e0b" }}>{p.stock}</div>
                      <div className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>{p.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Pending Orders", value: stats.orders.pending, href: "/admin/orders?status=pending", color: "#f59e0b" },
                { label: "Processing", value: stats.orders.processing, href: "/admin/orders?status=processing", color: "#a78bfa" },
                { label: "Shipped", value: stats.orders.shipped, href: "/admin/orders?status=shipped", color: "#38bdf8" },
                { label: "Delivered", value: stats.orders.delivered, href: "/admin/orders?status=delivered", color: "#22c55e" },
              ].map(item => (
                <Link key={item.label} href={item.href}
                  className="card rounded-2xl p-5 text-center hover:-translate-y-0.5 transition-all">
                  <div className="text-3xl font-black mb-1" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs tracking-wider" style={{ color: "var(--text-muted)" }}>{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p style={{ color: "var(--text-muted)" }}>Failed to load stats. Make sure you are logged in as admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
