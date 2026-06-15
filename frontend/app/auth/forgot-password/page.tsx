"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: "var(--bg-primary)" }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, #c9a84c30, transparent 60%)" }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
            ✈
          </div>
          <h1 className="text-3xl font-black tracking-wider" style={{ color: "var(--text-primary)" }}>
            FORGOT PASSWORD
          </h1>
          <p className="text-sm mt-2 tracking-wide" style={{ color: "var(--text-muted)" }}>
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        <div className="card rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📩</div>
              <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>Check Your Inbox</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                If <strong>{email}</strong> is registered, a password reset link has been sent. Check your spam folder too.
              </p>
              <Link href="/auth/login"
                className="btn-gold inline-block px-8 py-3 rounded-xl text-sm font-bold tracking-widest uppercase mt-4">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-widest font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm"
                  style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                Remember it?{" "}
                <Link href="/auth/login" className="font-bold hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
