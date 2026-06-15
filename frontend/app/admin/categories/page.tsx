"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Category } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/Alert";

interface ModalState {
  open: boolean;
  mode: "create" | "edit";
  category: Category | null;
}

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState<ModalState>({ open: false, mode: "create", category: null });
  const [form, setForm] = useState({ name: "", description: "" });

  // Auth guard
  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!user.is_admin) { router.push("/"); return; }
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.categories.list();
      setCategories(data);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ name: "", description: "" });
    setModal({ open: true, mode: "create", category: null });
    setError("");
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, description: cat.description ?? "" });
    setModal({ open: true, mode: "edit", category: cat });
    setError("");
  }

  function closeModal() {
    setModal({ open: false, mode: "create", category: null });
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Category name is required."); return; }
    setSaving(true);
    setError("");
    try {
      if (modal.mode === "create") {
        await api.categories.create({ name: form.name.trim(), description: form.description.trim() || undefined });
      } else if (modal.category) {
        await api.categories.update(modal.category.id, { name: form.name.trim(), description: form.description.trim() || undefined });
      }
      await load();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?\n\nWarning: Products in this category will lose their category association.`)) return;
    try {
      await api.categories.delete(cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category.");
    }
  }

  if (!user || !user.is_admin) return null;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-xs tracking-wider hover:text-sky-500 transition-colors"
              style={{ color: "var(--text-muted)" }}>
              ← Admin
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: "var(--gold)" }}>PAF STORE</p>
              <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>MANAGE CATEGORIES</h1>
            </div>
            <button onClick={openCreate}
              className="btn-gold px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider self-start sm:self-auto">
              + New Category
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <LoadingSkeleton count={4} height={72} />
        ) : categories.length === 0 ? (
          <div className="card rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4 opacity-20">🗂</div>
            <p className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>No categories yet</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Create your first category to organise products.</p>
            <button onClick={openCreate} className="btn-gold px-6 py-3 rounded-xl text-sm font-bold tracking-wider">
              + Create Category
            </button>
          </div>
        ) : (
          <div className="card rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold tracking-widest"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
              <div className="col-span-1">#</div>
              <div className="col-span-4">NAME</div>
              <div className="col-span-5">DESCRIPTION</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {categories.map((cat, idx) => (
                <div key={cat.id}
                  className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 items-center hover:bg-black/3 transition-colors">
                  {/* ID */}
                  <div className="hidden sm:block col-span-1 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {cat.id}
                  </div>
                  {/* Name */}
                  <div className="col-span-1 sm:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: "var(--gold)20", color: "var(--gold)" }}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{cat.name}</span>
                    </div>
                  </div>
                  {/* Description */}
                  <div className="hidden sm:block col-span-5 text-sm truncate" style={{ color: "var(--text-muted)" }}>
                    {cat.description || <span className="italic opacity-50">No description</span>}
                  </div>
                  {/* Actions */}
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(cat)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-black/5"
                      style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cat)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-red-900/30"
                      style={{ border: "1px solid #ef444440", color: "#ef4444" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 text-xs" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
              {categories.length} {categories.length === 1 ? "category" : "categories"} total
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black tracking-wide" style={{ color: "var(--text-primary)" }}>
                {modal.mode === "create" ? "New Category" : "Edit Category"}
              </h2>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-black/5 transition-colors"
                style={{ color: "var(--text-muted)" }}>×</button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  CATEGORY NAME *
                </label>
                <input
                  className="input-dark"
                  placeholder="e.g. Fighter Jets, T-Shirts, Caps…"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  DESCRIPTION (optional)
                </label>
                <textarea
                  className="input-dark resize-none"
                  rows={3}
                  placeholder="Brief description of this category…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {error && <div className="mt-4"><ErrorAlert message={error} /></div>}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal}
                className="flex-1 py-3 rounded-xl text-sm font-bold tracking-wider transition-colors hover:bg-black/5"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold tracking-wider disabled:opacity-50 btn-gold">
                {saving ? "Saving…" : modal.mode === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
