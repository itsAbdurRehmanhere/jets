"use client";

import { Category } from "@/lib/api";

const SIZES = ["Small", "Medium", "Large", "XL", "XXL"];

interface Props {
  categories: Category[];
  search: string;
  categoryId?: number;
  size: string;
  onSearch: (v: string) => void;
  onCategory: (v: number | undefined) => void;
  onSize: (v: string) => void;
}

export default function ProductFilters({
  categories,
  search,
  categoryId,
  size,
  onSearch,
  onCategory,
  onSize,
}: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-6">
      <h2 className="font-semibold text-gray-900">Filters</h2>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
          Search
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="e.g. F-16, Eagle..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onCategory(undefined)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !categoryId
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategory(cat.id === categoryId ? undefined : cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                categoryId === cat.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
          Size
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onSize(size === s ? "" : s)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                size === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-blue-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {(search || categoryId || size) && (
        <button
          onClick={() => {
            onSearch("");
            onCategory(undefined);
            onSize("");
          }}
          className="w-full text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
