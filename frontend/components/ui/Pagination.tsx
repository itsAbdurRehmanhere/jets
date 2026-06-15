interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors hover:bg-black/5"
        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={
            p === page
              ? { background: "var(--gold)", color: "#0a0e1a", fontWeight: 700 }
              : { border: "1px solid var(--border)", color: "var(--text-muted)" }
          }
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors hover:bg-black/5"
        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        Next →
      </button>
    </div>
  );
}
