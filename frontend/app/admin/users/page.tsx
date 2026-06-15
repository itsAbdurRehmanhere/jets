"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, AdminUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/Alert";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.admin.users.list({ skip: page * limit, limit, search: search || undefined });
      setUsers(res.data);
      setTotal(res.total);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!user.is_admin) { router.push("/"); return; }
    load();
  }, [user, load]);

  async function handleToggleAdmin(u: AdminUser) {
    const action = u.is_admin ? "Remove admin from" : "Promote";
    if (!confirm(`${action} "${u.username}"?`)) return;
    try {
      const res = await api.admin.users.toggleAdmin(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_admin: res.is_admin } : x));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user.");
    }
  }

  async function handleDelete(u: AdminUser) {
    if (!confirm(`Delete user "${u.username}" (${u.email})?\n\nThis cannot be undone.`)) return;
    try {
      await api.admin.users.delete(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setTotal(t => t - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user.");
    }
  }

  if (!user || !user.is_admin) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/admin" className="text-xs tracking-wider hover:text-sky-500 transition-colors mb-3 block"
            style={{ color: "var(--text-muted)" }}>← Admin</Link>
          <p className="text-xs tracking-widest mb-1" style={{ color: "var(--gold)" }}>PAF STORE</p>
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>MANAGE USERS</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {/* Search */}
        <div className="flex gap-3">
          <input
            className="input-dark flex-1 max-w-xs"
            placeholder="Search email or username..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(0); } }}
          />
          <button onClick={() => { setSearch(searchInput); setPage(0); }}
            className="btn-gold px-5 py-2 rounded-xl text-sm font-bold tracking-wider">
            Search
          </button>
          {search && (
            <button onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }}
              className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-black/5"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Clear
            </button>
          )}
        </div>

        <ErrorAlert message={error} />

        {loading ? (
          <LoadingSkeleton count={5} height={60} />
        ) : users.length === 0 ? (
          <div className="card rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4 opacity-20">👤</p>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>No users found</p>
          </div>
        ) : (
          <div className="card rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold tracking-widest"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
              <div className="col-span-1">#</div>
              <div className="col-span-3">USERNAME</div>
              <div className="col-span-3">EMAIL</div>
              <div className="col-span-1 text-center">ORDERS</div>
              <div className="col-span-1 text-center">CITY</div>
              <div className="col-span-1 text-center">ROLE</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {users.map(u => (
                <div key={u.id}
                  className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-black/3 transition-colors">
                  <div className="hidden md:block col-span-1 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{u.id}</div>
                  <div className="col-span-1 md:col-span-3">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{u.username}</span>
                  </div>
                  <div className="col-span-1 md:col-span-3 text-sm truncate" style={{ color: "var(--text-muted)" }}>{u.email}</div>
                  <div className="hidden md:block col-span-1 text-center text-sm font-bold" style={{ color: "var(--text-primary)" }}>{u.order_count}</div>
                  <div className="hidden md:block col-span-1 text-center text-sm truncate" style={{ color: "var(--text-muted)" }}>{u.city || "—"}</div>
                  <div className="hidden md:flex col-span-1 justify-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold`}
                      style={u.is_admin
                        ? { background: "#c9a84c20", color: "var(--gold)", border: "1px solid #c9a84c40" }
                        : { background: "#38bdf820", color: "#38bdf8", border: "1px solid #38bdf840" }}>
                      {u.is_admin ? "Admin" : "User"}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => handleToggleAdmin(u)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-black/5"
                      style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
                      {u.is_admin ? "Demote" : "Promote"}
                    </button>
                    <button onClick={() => handleDelete(u)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-red-900/30"
                      style={{ border: "1px solid #ef444440", color: "#ef4444" }}>
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 flex items-center justify-between text-xs"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
              <span>{total} user{total !== 1 ? "s" : ""} total</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-black/5 transition-colors"
                    style={{ border: "1px solid var(--border)" }}>←</button>
                  <span>{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-black/5 transition-colors"
                    style={{ border: "1px solid var(--border)" }}>→</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
