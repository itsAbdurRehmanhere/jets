export const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#f59e0b20", color: "#f59e0b" },
  confirmed:  { bg: "#3b82f620", color: "#60a5fa" },
  processing: { bg: "#8b5cf620", color: "#a78bfa" },
  shipped:    { bg: "#0ea5e920", color: "#38bdf8" },
  delivered:  { bg: "#22c55e20", color: "#22c55e" },
  cancelled:  { bg: "#ef444420", color: "#ef4444" },
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sc = STATUS_COLORS[status] || { bg: "#ffffff10", color: "var(--text-muted)" };
  const cls =
    size === "sm"
      ? "px-2 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase"
      : "px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase";
  return (
    <span className={cls} style={{ background: sc.bg, color: sc.color }}>
      {status}
    </span>
  );
}
