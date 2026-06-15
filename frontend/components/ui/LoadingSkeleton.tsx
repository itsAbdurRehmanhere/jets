interface LoadingSkeletonProps {
  count?: number;
  height?: number;
  layout?: "grid-3" | "grid-4" | "stack" | "single";
}

export function LoadingSkeleton({ count = 3, height = 120, layout = "stack" }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (layout === "single") {
    return (
      <div className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height }} />
    );
  }

  if (layout === "grid-3") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height }} />
        ))}
      </div>
    );
  }

  if (layout === "grid-4") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div key={i} className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height }} />
      ))}
    </div>
  );
}
