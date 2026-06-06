"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, Product, Category } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [productList, setProductList] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("category_id") ? Number(searchParams.get("category_id")) : undefined
  );
  const [size, setSize] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await api.products.list({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
        category_id: categoryId,
        size: size || undefined,
      });
      setProductList(res.products);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.categories.list().then(setCategoryList).catch(() => {});
  }, []);

  useEffect(() => { setPage(1); }, [search, categoryId, size]);
  useEffect(() => { fetchProducts(); }, [page, search, categoryId, size]);

  const totalPages = Math.ceil(total / limit);

  const selectedCat = categoryList.find(c => c.id === categoryId);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs tracking-widest mb-2 uppercase" style={{ color: "var(--gold)" }}>PAF Store</p>
          <h1 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            {selectedCat ? selectedCat.name.toUpperCase() : "ALL PRODUCTS"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            {total} {total === 1 ? "product" : "products"} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="card rounded-2xl p-4 sm:p-6 sticky top-24">
              <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>FILTER & SEARCH</h3>

              {/* Search */}
              <div className="mb-5">
                <label className="block text-xs tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>SEARCH</label>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="input-dark"
                />
              </div>

              {/* Categories */}
              <div className="mb-5">
                <label className="block text-xs tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>CATEGORY</label>
                <button
                  onClick={() => setCategoryId(undefined)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors"
                  style={{
                    background: !categoryId ? "#c9a84c20" : "transparent",
                    color: !categoryId ? "var(--gold)" : "var(--text-muted)",
                    border: !categoryId ? "1px solid #c9a84c40" : "1px solid transparent",
                  }}>
                  All Categories
                </button>
                {categoryList.map(cat => (
                  <button key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors"
                    style={{
                      background: categoryId === cat.id ? "#c9a84c20" : "transparent",
                      color: categoryId === cat.id ? "var(--gold)" : "var(--text-muted)",
                      border: categoryId === cat.id ? "1px solid #c9a84c40" : "1px solid transparent",
                    }}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Size */}
              <div className="mb-5">
                <label className="block text-xs tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>SIZE</label>
                <select value={size} onChange={e => setSize(e.target.value)} className="input-dark">
                  <option value="">All Sizes</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              {/* Clear */}
              {(search || categoryId || size) && (
                <button
                  onClick={() => { setSearch(""); setCategoryId(undefined); setSize(""); }}
                  className="w-full py-2 rounded-lg text-xs tracking-wider transition-colors hover:bg-white/5"
                  style={{ color: "#ef4444", border: "1px solid #ef444440" }}>
                  CLEAR FILTERS
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height: 320 }} />
                ))}
              </div>
            ) : productList.length === 0 ? (
              <div className="text-center py-32">
                <div className="text-7xl mb-6 opacity-20">✈</div>
                <p className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No products found</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productList.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors hover:bg-white/5"
                  style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className="px-4 py-2 rounded-lg text-sm transition-colors"
                    style={p === page
                      ? { background: "var(--gold)", color: "#0a0e1a", fontWeight: 700 }
                      : { border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors hover:bg-white/5"
                  style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
