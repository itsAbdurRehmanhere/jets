import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-16">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-12">

          {/* Brand — spans 2 cols on md */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
                ✈
              </div>
              <div className="leading-tight">
                <div className="font-black text-base tracking-widest" style={{ color: "var(--text-primary)" }}>PAF STORE</div>
                <div className="text-xs tracking-widest" style={{ color: "var(--gold)" }}>COLLECTIBLES</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
              Premium Pakistan Air Force collectibles — handcrafted fighter jet models,
              sculptures, trophies, and memorabilia for aviation enthusiasts.
            </p>
            <a href="https://wa.me/923207331147" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-black/5"
              style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
              💬 WhatsApp Us
            </a>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-xs font-black tracking-widest mb-5 uppercase" style={{ color: "var(--gold)" }}>Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", href: "/products" },
                { label: "Jet Models", href: "/products?category_id=1" },
                { label: "Sculptures", href: "/products?category_id=2" },
                { label: "Trophies", href: "/products?category_id=3" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-sky-500"
                    style={{ color: "var(--text-muted)" }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-xs font-black tracking-widest mb-5 uppercase" style={{ color: "var(--gold)" }}>Account</h4>
            <ul className="space-y-3">
              {[
                { label: "Login", href: "/auth/login" },
                { label: "Register", href: "/auth/register" },
                { label: "My Orders", href: "/orders" },
                { label: "Profile", href: "/profile" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-sky-500"
                    style={{ color: "var(--text-muted)" }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.5rem" }} />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left"
          style={{ color: "var(--text-muted)" }}>
          <p>© {new Date().getFullYear()} PAF Store. All rights reserved.</p>
          <p className="tracking-wider">FREE SHIPPING ON ORDERS OVER PKR 10,000</p>
        </div>

      </div>
    </footer>
  );
}
