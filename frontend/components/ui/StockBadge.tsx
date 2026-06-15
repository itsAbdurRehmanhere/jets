interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span
        className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
        style={{ background: "#ef4444", color: "white" }}
      >
        SOLD OUT
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span
        className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
        style={{ background: "var(--gold-light)", color: "#0a0e1a" }}
      >
        LOW STOCK
      </span>
    );
  }
  return null;
}
