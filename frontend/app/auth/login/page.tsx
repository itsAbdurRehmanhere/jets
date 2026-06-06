"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      login(res.access_token, res.refresh_token, res.user);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 relative"
      style={{ background: "var(--bg-primary)" }}>
      {/* Background glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, #c9a84c30, transparent 60%)"
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
            ✈
          </div>
          <h1 className="text-3xl font-black tracking-wider" style={{ color: "var(--text-primary)" }}>
            WELCOME BACK
          </h1>
          <p className="text-sm mt-2 tracking-wide" style={{ color: "var(--text-muted)" }}>
            Sign in to your PAF Store account
          </p>
        </div>

        <div className="card rounded-2xl p-8">
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

            <div>
              <label className="block text-xs tracking-widest font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                PASSWORD
              </label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-dark"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-bold hover:text-yellow-400 transition-colors" style={{ color: "var(--gold)" }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
