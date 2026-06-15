"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api, API_URL, Product, Category } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { SuccessAlert, ErrorAlert } from "@/components/ui/Alert";

type ProductForm = {
  title: string;
  description: string;
  price: string;
  stock: string;
  size: string;
  category_id: string;
};

const emptyForm: ProductForm = {
  title: "", description: "", price: "", stock: "0", size: "", category_id: "",
};

export default function AdminProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Modal state
  const [modal, setModal] = useState<"create" | "edit" | "images" | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Image upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { skip: page * limit, limit };
      if (search) params.search = search;
      if (filterCategory) params.category_id = parseInt(filterCategory);
      const r = await api.admin.products.list(params as Parameters<typeof api.admin.products.list>[0]);
      setProducts(r.products);
      setTotal(r.total);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, page]);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!user.is_admin) { router.push("/"); return; }
    fetchProducts();
    api.categories.list().then(setCategories).catch(() => {});
  }, [user, fetchProducts]);

  function openCreate() {
    setForm(emptyForm);
    setActiveProduct(null);
    setSaveMsg("");
    setModal("create");
  }

  function openEdit(product: Product) {
    setActiveProduct(product);
    setForm({
      title: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      size: product.size || "",
      category_id: String(product.category_id || ""),
    });
    setSaveMsg("");
    setModal("edit");
  }

  function openImages(product: Product) {
    setActiveProduct(product);
    setUploadFiles([]);
    setUploadMsg("");
    setModal("images");
  }

  async function handleSave() {
    if (!form.title.trim() || !form.price) { setSaveMsg("Name and price are required"); return; }
    setSaving(true);
    setSaveMsg("");
    try {
      const data = {
        title: form.title.trim(),
        description: form.description || undefined,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        size: form.size || undefined,
        category_id: form.category_id ? parseInt(form.category_id) : undefined,
      };
      if (modal === "create") {
        await api.admin.products.create(data);
        setSaveMsg("✓ Product created!");
      } else if (activeProduct) {
        await api.admin.products.update(activeProduct.id, data);
        setSaveMsg("✓ Product updated!");
      }
      fetchProducts();
      setTimeout(() => { setModal(null); setSaveMsg(""); }, 800);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleteId(id);
    try {
      await api.admin.products.delete(id);
      fetchProducts();
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleUploadImages() {
    if (!activeProduct || uploadFiles.length === 0) return;
    setUploading(true);
    setUploadMsg("");
    try {
      await api.admin.products.uploadImages(activeProduct.id, uploadFiles);
      setUploadMsg(`✓ Uploaded ${uploadFiles.length} image(s)!`);
      setUploadFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchProducts();
      // Refresh active product images
      const updated = await api.products.get(activeProduct.id);
      setActiveProduct(updated);
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!confirm("Delete this image?")) return;
    try {
      await api.admin.products.deleteImage(imageId);
      if (activeProduct) {
        const updated = await api.products.get(activeProduct.id);
        setActiveProduct(updated);
        fetchProducts();
      }
    } catch {
      alert("Delete failed");
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
              <div className="mb-1">
                <Link href="/admin" className="text-xs tracking-widest hover:text-sky-500 transition-colors"
                  style={{ color: "var(--text-muted)" }}>← DASHBOARD</Link>
              </div>
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Admin Panel</p>
              <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                PRODUCTS MANAGEMENT
              </h1>
            </div>
            <button onClick={openCreate}
              className="btn-gold px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase self-start sm:self-center">
              + Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..." className="input-dark flex-1 max-w-xs" />
            <button type="submit" className="btn-gold px-5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase">
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }}
                className="px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Clear
              </button>
            )}
          </form>
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
            className="input-dark max-w-[180px]">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
          <span><span className="font-bold" style={{ color: "var(--text-primary)" }}>{total}</span> products</span>
        </div>

        {/* Products Table */}
        {loading ? (
          <LoadingSkeleton count={4} height={80} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-20">📦</div>
            <p className="text-lg font-bold mb-4" style={{ color: "var(--text-muted)" }}>No products found</p>
            <button onClick={openCreate} className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase">
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                  {["Image", "Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-widest uppercase"
                      style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => {
                  const cat = categories.find(c => c.id === product.category_id);
                  const imgUrl = product.images?.[0] ? `${API_URL}${product.images[0].url}` : null;
                  return (
                    <tr key={product.id}
                      style={{
                        background: idx % 2 === 0 ? "var(--bg-secondary)" : "var(--bg-primary)",
                        borderBottom: "1px solid var(--border)"
                      }}>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--bg-card)" }}>
                          {imgUrl ? (
                            <Image src={imgUrl} alt={product.name} width={48} height={48}
                              className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg opacity-20">✈</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>{product.name}</p>
                        {product.size && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{product.size}</p>}
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {product.images?.length || 0} image{(product.images?.length || 0) !== 1 ? "s" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {cat?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-gold-gradient">
                          PKR {Number(product.price).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full`}
                          style={product.stock === 0
                            ? { background: "#ef444420", color: "#ef4444" }
                            : product.stock <= 5
                              ? { background: "#f59e0b20", color: "#f59e0b" }
                              : { background: "#22c55e20", color: "#22c55e" }}>
                          {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => openEdit(product)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                            style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}>
                            Edit
                          </button>
                          <button onClick={() => openImages(product)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
                            Images
                          </button>
                          <button onClick={() => handleDelete(product.id)} disabled={deleteId === product.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 disabled:opacity-40"
                            style={{ background: "#ef444415", color: "#ef4444", border: "1px solid #ef444430" }}>
                            {deleteId === product.id ? "..." : "Delete"}
                          </button>
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

      {/* Create / Edit Product Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="rounded-2xl w-full max-w-lg p-6 space-y-5 my-8"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>
                  {modal === "create" ? "New Product" : "Edit Product"}
                </p>
                <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                  {modal === "create" ? "Add Product" : form.title || "Edit"}
                </h2>
              </div>
              <button onClick={() => setModal(null)} className="text-xl" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>PRODUCT NAME *</label>
                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. JF-17 Thunder Scale Model" className="input-dark" />
              </div>

              <div>
                <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Product description..." rows={3} className="input-dark resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>PRICE (PKR) *</label>
                  <input type="number" min="0" value={form.price}
                    onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="8900" className="input-dark" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>STOCK</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="10" className="input-dark" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>SIZE</label>
                  <input value={form.size} onChange={(e) => setForm(f => ({ ...f, size: e.target.value }))}
                    placeholder='e.g. 12"' className="input-dark" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>CATEGORY</label>
                  <select value={form.category_id} onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="input-dark">
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {saveMsg && (saveMsg.startsWith("✓")
              ? <SuccessAlert message={saveMsg} />
              : <ErrorAlert message={saveMsg} />
            )}

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="btn-gold flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                {saving ? "Saving..." : modal === "create" ? "Create Product" : "Save Changes"}
              </button>
              <button onClick={() => setModal(null)}
                className="px-6 py-3 rounded-xl text-sm font-bold"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Images Modal */}
      {modal === "images" && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="rounded-2xl w-full max-w-lg p-6 space-y-5 my-8"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Product Images</p>
                <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{activeProduct.name}</h2>
              </div>
              <button onClick={() => setModal(null)} className="text-xl" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>

            {/* Current Images */}
            {activeProduct.images && activeProduct.images.length > 0 ? (
              <div>
                <p className="text-xs font-bold tracking-widest mb-3 uppercase" style={{ color: "var(--text-muted)" }}>
                  Current Images ({activeProduct.images.length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {activeProduct.images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square"
                      style={{ background: "var(--bg-card)" }}>
                      <Image src={`${API_URL}${img.url}`} alt="Product" fill className="object-cover" unoptimized />
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ background: "var(--gold)", color: "#0a0e1a" }}>Primary</span>
                      )}
                      <button onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "#ef4444", color: "white" }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl" style={{ background: "var(--bg-card)" }}>
                <div className="text-3xl mb-2 opacity-20">🖼</div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No images yet</p>
              </div>
            )}

            {/* Upload new images */}
            <div>
              <p className="text-xs font-bold tracking-widest mb-3 uppercase" style={{ color: "var(--text-muted)" }}>
                Upload New Images
              </p>
              <div className="rounded-xl p-4 text-center cursor-pointer transition-all"
                style={{ border: "2px dashed var(--border)", background: "var(--bg-card)" }}
                onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))} />
                {uploadFiles.length > 0 ? (
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--gold)" }}>
                      {uploadFiles.length} file{uploadFiles.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {uploadFiles.map(f => f.name).join(", ")}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-1 opacity-40">🔍</div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Click to select images (JPG, PNG, WebP · max 5MB each)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {uploadMsg && (uploadMsg.startsWith("✓")
              ? <SuccessAlert message={uploadMsg} />
              : <ErrorAlert message={uploadMsg} />
            )}

            <div className="flex gap-3">
              {uploadFiles.length > 0 && (
                <button onClick={handleUploadImages} disabled={uploading}
                  className="btn-gold flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                  {uploading ? "Uploading..." : `Upload ${uploadFiles.length} Image${uploadFiles.length > 1 ? "s" : ""}`}
                </button>
              )}
              <button onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
