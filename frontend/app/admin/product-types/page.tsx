"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Category, ProductType } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/Alert";

interface ModalState {
  open: boolean;
  mode: "create" | "edit";
  productType: ProductType | null;
}

export default function AdminProductTypesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState<ModalState>({ open: false, mode: "create", productType: null });
  const [form, setForm] = useState({ name: "", description: "", category_id: "" });

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!user.is_admin) { router.push("/"); return; }
    api.categories.list().then(setCategories).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!selectedCat) { setProductTypes([]); return; }
    setLoading(true);
    api.productTypes.byCategory(Number(selectedCat))
      .then(r => setProductTypes(r.product_types ?? []))
      .catch(() => setProductTypes([]))
      .finally(() => setLoading(false));
  }, [selectedCat]);

  function openCreate() {
    setForm({ name: "", description: "", category_id: String(selectedCat) });
    setModal({ open: true, mode: "create", productType: null });
    setError("");
  }

  function openEdit(pt: ProductType) {
    setForm({ name: pt.name, description: pt.description ?? "", category_id: String(pt.category_id) });
    setModal({ open: true, mode: "edit", productType: pt });
    setError("");
  }

  function closeModal() {
    setModal({ open: false, mode: "create", productType: null });
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.category_id) { setError("Category is required."); return; }
    setSaving(true);
    setError("");
    try {
      if (modal.mode === "create") {
        const pt = await api.productTypes.create({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          category_id: Number(form.category_id),
        });
        if (Number(form.category_id) === Number(selectedCat)) {
          setProductTypes(prev => [...prev, pt]);
        }
      } else if (modal.productType) {
        const pt = await api.productTypes.update(modal.productType.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
        setProductTypes(prev => prev.map(x => x.id === modal.productType!.id ? pt : x));
      }
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pt: ProductType) {
    if (!confirm(`Delete product type "${pt.name}"?\n\nProducts using this type will lose their type association.`)) return;
    try {
      await api.productTypes.delete(pt.id);
      setProductTypes(prev => prev.filter(x => x.id !== pt.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  if (!user || !user.is_admin) return null;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/admin" className="text-xs tracking-wider hover:text-sky-500 transition-colors mb-3 block"
            style={{ color: "var(--text-muted)" }}>← Admin</Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: "var(--gold)" }}>PAF STORE</p>
              <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>MANAGE PRODUCT TYPES</h1>
            </div>
            <button onClick={openCreate}
              className="btn-gold px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider self-start sm:self-auto">
              + New Type
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {/* Category filter */}
        <div>
          <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>FILTER BY CATEGORY</label>
          <select
            className="input-dark max-w-xs"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {!selectedCat ? (
          <div className="card rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3 opacity-20">📂</p>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>Select a category above to view its product types</p>
          </div>
        ) : loading ? (
          <LoadingSkeleton count={3} height={60} />
        ) : productTypes.length === 0 ? (
          <div className="card rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3 opacity-20">📂</p>
            <p className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>No product types in this category</p>
            <button onClick={openCreate} className="btn-gold px-6 py-2.5 rounded-xl text-sm font-bold tracking-wider">
              + Create First Type
            </button>
          </div>
        ) : (
          <div className="card rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold tracking-widest"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
              <div className="col-span-1">#</div>
              <div className="col-span-4">NAME</div>
              <div className="col-span-5">DESCRIPTION</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {productTypes.map((pt, idx) => (
                <div key={pt.id}
                  className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 items-center hover:bg-black/3 transition-colors">
                  <div className="hidden sm:block col-span-1 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{pt.id}</div>
                  <div className="col-span-1 sm:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: "var(--gold)20", color: "var(--gold)" }}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{pt.name}</span>
                    </div>
                  </div>
                  <div className="hidden sm:block col-span-5 text-sm truncate" style={{ color: "var(--text-muted)" }}>
                    {pt.description || <span className="italic opacity-50">No description</span>}
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(pt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-black/5"
                      style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>Edit</button>
                    <button onClick={() => handleDelete(pt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-red-900/30"
                      style={{ border: "1px solid #ef444440", color: "#ef4444" }}>Del</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 text-xs" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
              {productTypes.length} type{productTypes.length !== 1 ? "s" : ""} in this category
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black tracking-wide" style={{ color: "var(--text-primary)" }}>
                {modal.mode === "create" ? "New Product Type" : "Edit Product Type"}
              </h2>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-black/5 transition-colors"
                style={{ color: "var(--text-muted)" }}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>CATEGORY *</label>
                <select className="input-dark" value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  disabled={modal.mode === "edit"}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>TYPE NAME *</label>
                <input className="input-dark" placeholder="e.g. Fighter Jets, Die-Cast Models..."
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleSave(); }} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>DESCRIPTION (optional)</label>
                <textarea className="input-dark resize-none" rows={3}
                  placeholder="Brief description..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            {error && <div className="mt-4"><ErrorAlert message={error} /></div>}
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal}
                className="flex-1 py-3 rounded-xl text-sm font-bold tracking-wider transition-colors hover:bg-black/5"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold tracking-wider disabled:opacity-50 btn-gold">
                {saving ? "Saving..." : modal.mode === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
