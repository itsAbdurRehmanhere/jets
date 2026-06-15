"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, Product, Category } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

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

  // Sync category filter when URL changes (e.g. navbar links)
  useEffect(() => {
    const catId = searchParams.get("category_id");
    setCategoryId(catId ? Number(catId) : undefined);
  }, [searchParams]);

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
      <PageHeader
        title={selectedCat ? selectedCat.name.toUpperCase() : "ALL PRODUCTS"}
        subtitle={`${total} ${total === 1 ? "product" : "products"} found`}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-2xl sticky top-24 overflow-hidden"
              style={{ border: "1.5px solid var(--border)", background: "#fff", boxShadow: "0 4px 24px rgba(2,132,199,0.08)" }}>

              {/* Header */}
              <div className="px-5 py-4" style={{ background: "var(--gold)", }}>
                <h3 className="text-xs font-black tracking-widest text-white">FILTER & SEARCH</h3>
              </div>

              <div className="p-5 space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: "var(--gold)" }}>SEARCH</label>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="input-dark"
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: "var(--gold)" }}>CATEGORY</label>
                  <div className="space-y-1">
                    {[{ id: undefined, name: "All Categories" }, ...categoryList].map(cat => {
                      const active = cat.id === undefined ? !categoryId : categoryId === cat.id;
                      return (
                        <button
                          key={cat.id ?? "all"}
                          onClick={() => setCategoryId(cat.id)}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                          style={active ? {
                            background: "var(--gold)",
                            color: "#ffffff",
                            fontWeight: 700,
                          } : {
                            background: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border)",
                          }}>
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: "var(--gold)" }}>SIZE</label>
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
                    className="w-full py-2.5 rounded-lg text-xs font-bold tracking-widest transition-colors hover:bg-red-50"
                    style={{ color: "#ef4444", border: "1.5px solid #ef444460" }}>
                    ✕ CLEAR FILTERS
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <LoadingSkeleton count={6} height={320} layout="grid-3" />
            ) : productList.length === 0 ? (
              <EmptyState icon="✈" title="No products found" description="Try adjusting your filters" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productList.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
