import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function EmptyState({
  icon = "✈",
  title,
  description,
  ctaText,
  ctaHref = "/products",
}: EmptyStateProps) {
  return (
    <div className="text-center py-24">
      <div className="text-7xl mb-6 opacity-20">{icon}</div>
      <h2 className="text-2xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      {description && (
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      )}
      {ctaText && (
        <Link href={ctaHref} className="btn-gold px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase">
          {ctaText}
        </Link>
      )}
    </div>
  );
}
