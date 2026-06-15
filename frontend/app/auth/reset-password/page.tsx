"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Missing reset token. Please use the link from your email.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid or expired reset link.");
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
            RESET PASSWORD
          </h1>
          <p className="text-sm mt-2 tracking-wide" style={{ color: "var(--text-muted)" }}>
            Choose a new password for your account
          </p>
        </div>

        <div className="card rounded-2xl p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>Password Updated!</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Your password has been reset. Redirecting to login...
              </p>
              <Link href="/auth/login"
                className="btn-gold inline-block px-8 py-3 rounded-xl text-sm font-bold tracking-widest uppercase">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-widest font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                  NEW PASSWORD
                </label>
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password" required value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="input-dark"
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm"
                  style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !token}
                className="btn-gold w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                {loading ? "Saving..." : "Reset Password"}
              </button>

              <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                <Link href="/auth/login" className="font-bold hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
