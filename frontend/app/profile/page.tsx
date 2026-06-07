"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, UserProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    api.profile.get().then(p => { setProfile(p); }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true); setMsg(""); setError("");
    try {
      const updated = await api.profile.update({
        username: profile.username,
        phone: profile.phone || undefined,
        address: profile.address || undefined,
        city: profile.city || undefined,
        country: profile.country || undefined,
      });
      setProfile(updated);
      setMsg("Profile updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePwChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("Passwords do not match"); return;
    }
    setPwSaving(true); setPwMsg(""); setPwError("");
    try {
      await api.profile.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
        confirm_password: pwForm.confirm_password,
      });
      setPwMsg("Password changed successfully!");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPwMsg(""), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setPwSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10 text-center">
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--gold)" }}>PAF Store</p>
          <h1 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--text-primary)" }}>MY PROFILE</h1>
          <div className="divider-gold mx-auto mt-4" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="rounded-2xl animate-pulse" style={{ background: "var(--bg-card)", height: 400 }} />
        ) : (
          <>
            {/* Profile form */}
            <div className="card rounded-2xl p-6">
              <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>ACCOUNT INFORMATION</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>USERNAME</label>
                    <input value={profile?.username || ""} onChange={e => setProfile(p => p ? {...p, username: e.target.value} : p)}
                      className="input-dark" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>EMAIL</label>
                    <input value={profile?.email || ""} disabled className="input-dark opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>PHONE</label>
                    <input value={profile?.phone || ""} onChange={e => setProfile(p => p ? {...p, phone: e.target.value} : p)}
                      placeholder="+92 300 1234567" className="input-dark" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>CITY</label>
                    <input value={profile?.city || ""} onChange={e => setProfile(p => p ? {...p, city: e.target.value} : p)}
                      placeholder="Lahore" className="input-dark" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>ADDRESS</label>
                  <input value={profile?.address || ""} onChange={e => setProfile(p => p ? {...p, address: e.target.value} : p)}
                    placeholder="Street address" className="input-dark" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>COUNTRY</label>
                  <input value={profile?.country || ""} onChange={e => setProfile(p => p ? {...p, country: e.target.value} : p)}
                    placeholder="Pakistan" className="input-dark" />
                </div>

                {msg && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}>{msg}</div>}
                {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>{error}</div>}

                <button type="submit" disabled={saving}
                  className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Password change */}
            <div className="card rounded-2xl p-6">
              <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>CHANGE PASSWORD</h3>
              <form onSubmit={handlePwChange} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>CURRENT PASSWORD</label>
                  <input type="password" value={pwForm.current_password}
                    onChange={e => setPwForm(f => ({...f, current_password: e.target.value}))}
                    placeholder="••••••••" className="input-dark" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>NEW PASSWORD</label>
                    <input type="password" value={pwForm.new_password}
                      onChange={e => setPwForm(f => ({...f, new_password: e.target.value}))}
                      placeholder="Min 8 characters" className="input-dark" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>CONFIRM PASSWORD</label>
                    <input type="password" value={pwForm.confirm_password}
                      onChange={e => setPwForm(f => ({...f, confirm_password: e.target.value}))}
                      placeholder="Repeat password" className="input-dark" />
                  </div>
                </div>

                {pwMsg && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}>{pwMsg}</div>}
                {pwError && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}>{pwError}</div>}

                <button type="submit" disabled={pwSaving}
                  className="btn-gold px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase disabled:opacity-60">
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
