import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#050810", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: "linear-gradient(135deg, var(--gold-light), var(--gold))", color: "#0a0e1a" }}>
                ✈
              </div>
              <div>
                <div className="font-black text-lg tracking-wider" style={{ color: "var(--text-primary)" }}>PAF STORE</div>
                <div className="text-xs tracking-widest" style={{ color: "var(--gold)" }}>COLLECTIBLES</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-muted)" }}>
              Premium Pakistan Air Force collectibles — handcrafted fighter jet models, sculptures,
              trophies, and memorabilia for aviation enthusiasts and proud patriots.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-colors hover:bg-white/5"
                style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>SHOP</h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", href: "/products" },
                { label: "Jet Models", href: "/products?category_id=1" },
                { label: "Sculptures", href: "/products?category_id=2" },
                { label: "Trophies", href: "/products?category_id=3" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-yellow-400"
                    style={{ color: "var(--text-muted)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>ACCOUNT</h4>
            <ul className="space-y-3">
              {[
                { label: "Login", href: "/auth/login" },
                { label: "Register", href: "/auth/register" },
                { label: "My Orders", href: "/orders" },
                { label: "Profile", href: "/profile" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-yellow-400"
                    style={{ color: "var(--text-muted)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--border)", marginBottom: 24 }} />

        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 text-xs text-center sm:text-left"
          style={{ color: "var(--text-muted)" }}>
          <p>© {new Date().getFullYear()} PAF Store. All rights reserved.</p>
          <p className="tracking-wider">
            FREE SHIPPING ON ORDERS OVER PKR 10,000
          </p>
        </div>
      </div>
    </footer>
  );
}
