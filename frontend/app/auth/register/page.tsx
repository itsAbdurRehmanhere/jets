"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.register(form);
      router.push("/auth/login?registered=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: "var(--bg-primary)" }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, #c9a84c30, transparent 60%)"
      }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
            ✈
          </div>
          <h1 className="text-3xl font-black tracking-wider" style={{ color: "var(--text-primary)" }}>CREATE ACCOUNT</h1>
          <p className="text-sm mt-2 tracking-wide" style={{ color: "var(--text-muted)" }}>Join PAF Store today</p>
        </div>

        <div className="card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest font-medium mb-2" style={{ color: "var(--text-muted)" }}>USERNAME</label>
              <input name="username" required value={form.username} onChange={handleChange}
                placeholder="yourname" className="input-dark" />
            </div>
            <div>
              <label className="block text-xs tracking-widest font-medium mb-2" style={{ color: "var(--text-muted)" }}>EMAIL ADDRESS</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="you@example.com" className="input-dark" />
            </div>
            <div>
              <label className="block text-xs tracking-widest font-medium mb-2" style={{ color: "var(--text-muted)" }}>PASSWORD</label>
              <input name="password" type="password" required minLength={8} value={form.password} onChange={handleChange}
                placeholder="Min 8 characters" className="input-dark" />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold hover:text-yellow-400 transition-colors" style={{ color: "var(--gold)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
