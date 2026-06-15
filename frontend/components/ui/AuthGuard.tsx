"use client";

import Link from "next/link";

interface AuthGuardProps {
  icon?: string;
  message?: string;
}

export function AuthGuard({ icon, message = "Please log in to continue." }: AuthGuardProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="text-center">
        {icon && <div className="text-6xl mb-4 opacity-20">{icon}</div>}
        <h2 className="text-2xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
          Sign In Required
        </h2>
        <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
          {message}
        </p>
        <Link
          href="/auth/login"
          className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase"
        >
          LOGIN
        </Link>
      </div>
    </div>
  );
}
