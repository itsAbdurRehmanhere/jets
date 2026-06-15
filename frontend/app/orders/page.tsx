"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, Order } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
      <PageHeader title="MY ORDERS" maxWidth="max-w-4xl" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSkeleton count={3} height={100} />
        ) : orders.length === 0 ? (
          <EmptyState icon="📦" title="No Orders Yet" description="Start shopping to see your orders here" ctaText="Browse Collection" />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-yellow-500/30 transition-all block">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-sm tracking-wider" style={{ color: "var(--text-primary)" }}>
                      #{order.order_number || order.id}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
