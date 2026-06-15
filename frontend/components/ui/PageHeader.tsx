import React from "react";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: React.ReactNode;
  maxWidth?: string;
  align?: "center" | "left";
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  eyebrow = "PAF Store",
  subtitle,
  maxWidth = "max-w-7xl",
  align = "center",
  children,
}: PageHeaderProps) {
  return (
    <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
      <div className={`${maxWidth} mx-auto px-6 lg:px-8 py-10 ${align === "center" ? "text-center" : ""}`}>
        {eyebrow && (
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--gold)" }}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        {align === "center" && <div className="divider-gold mx-auto mt-4" />}
        {subtitle && (
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
