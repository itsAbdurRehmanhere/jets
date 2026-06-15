"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Order } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge, STATUS_COLORS } from "@/components/ui/StatusBadge";
import { SuccessAlert, ErrorAlert } from "@/components/ui/Alert";

const STATUS_TABS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

const extendedColors: Record<string, { bg: string; color: string }> = {
  ...STATUS_COLORS,
  refunded: { bg: "#f4363620", color: "#f43636" },
};

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Edit modal state
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { skip: page * limit, limit };
      if (activeTab !== "all") params.status = activeTab;
      if (search) params.order_number = search;
      const r = await api.orders.adminAll(params as Parameters<typeof api.orders.adminAll>[0]);
      setOrders(r.orders);
      setTotal(r.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!user.is_admin) { router.push("/"); return; }
    fetchOrders();
  }, [user, fetchOrders]);

  function openEdit(order: Order) {
    setEditOrder(order);
    setEditStatus(order.status);
    setEditPayment(order.payment_status || "pending");
    setEditNotes(order.admin_notes || "");
    setEditTracking(order.tracking_number || "");
    setSaveMsg("");
  }

  async function saveEdit() {
    if (!editOrder) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await api.orders.updateStatus(editOrder.id, editStatus, editPayment, editNotes);
      setSaveMsg("✓ Updated successfully");
      fetchOrders();
      setTimeout(() => { setEditOrder(null); setSaveMsg(""); }, 800);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  }

  if (!user || !user.is_admin) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/admin" className="text-xs tracking-widest hover:text-sky-500 transition-colors"
                  style={{ color: "var(--text-muted)" }}>← DASHBOARD</Link>
              </div>
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Admin Panel</p>
              <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                ORDERS MANAGEMENT
              </h1>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-gold-gradient">{total}</div>
              <div className="text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>TOTAL ORDERS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setPage(0); }}
              className="px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all"
              style={activeTab === tab
                ? { background: "var(--gold)", color: "#0a0e1a" }
                : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order number..."
            className="input-dark flex-1 max-w-xs"
          />
          <button type="submit" className="btn-gold px-5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }}
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-widest"
              style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              Clear
            </button>
          )}
        </form>

        {/* Orders Table */}
        {loading ? (
          <LoadingSkeleton count={5} height={64} />
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-20">📦</div>
            <p className="text-lg font-bold" style={{ color: "var(--text-muted)" }}>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                  {["Order #", "Customer", "Items", "Total", "Status", "Payment", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-widest uppercase"
                      style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const pc = extendedColors[order.payment_status || "pending"] || { bg: "#ffffff10", color: "var(--text-muted)" };
                  return (
                    <tr key={order.id}
                      style={{
                        background: idx % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-primary)",
                        borderBottom: "1px solid var(--border)"
                      }}>
                      <td className="px-4 py-3">
                        <span className="font-bold text-xs" style={{ color: "var(--gold)" }}>
                          #{order.order_number || order.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {order.customer_name || "—"}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {order.customer_email || ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {order.items?.length ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-xs text-gold-gradient">
                          PKR {Number(order.total_amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase"
                          style={{ background: pc.bg, color: pc.color }}>
                          {order.payment_status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(order)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:opacity-80"
                            style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}>
                            Edit
                          </button>
                          <Link href={`/orders/${order.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:opacity-80"
                            style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing {page * limit + 1}—{Math.min((page + 1) * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                ← Prev
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditOrder(null); }}>
          <div className="rounded-2xl w-full max-w-lg p-6 space-y-5"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Update Order</p>
                <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                  #{editOrder.order_number || editOrder.id}
                </h2>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {editOrder.customer_name} · {editOrder.customer_email}
                </p>
              </div>
              <button onClick={() => setEditOrder(null)}
                className="text-xl leading-none" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>ORDER STATUS</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                  className="input-dark">
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>PAYMENT STATUS</label>
                <select value={editPayment} onChange={(e) => setEditPayment(e.target.value)}
                  className="input-dark">
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>TRACKING NUMBER (OPTIONAL)</label>
              <input value={editTracking} onChange={(e) => setEditTracking(e.target.value)}
                placeholder="e.g. TCS-1234567" className="input-dark" />
            </div>

            <div>
              <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>ADMIN NOTES (OPTIONAL)</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Internal notes about this order..."
                rows={3} className="input-dark resize-none" />
            </div>

            {/* Order summary */}
            {editOrder.items && editOrder.items.length > 0 && (
              <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--bg-card)" }}>
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--gold)" }}>Items</p>
                {editOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>PKR {(Number(item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <span>Total</span>
                  <span className="text-gold-gradient">PKR {Number(editOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>
            )}

            {saveMsg && (saveMsg.startsWith("✓")
              ? <SuccessAlert message={saveMsg} />
              : <ErrorAlert message={saveMsg} />
            )}

            <div className="flex gap-3">
              <button onClick={saveEdit} disabled={saving}
                className="btn-gold flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditOrder(null)}
                className="px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
