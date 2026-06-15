import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}
      className="flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-black mb-2 text-gold-gradient">404</div>
        <div className="text-6xl mb-6">✈</div>
        <h1 className="text-2xl md:text-3xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
          PAGE NOT FOUND
        </h1>
        <div className="divider-gold mx-auto mb-6" />
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          The page you are looking for has either been moved, deleted, or never existed.
          Head back to the hangar and find what you need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-gold px-10 py-3 rounded-xl text-sm font-bold tracking-widest uppercase">
            Back to Home
          </Link>
          <Link href="/products"
            className="px-10 py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-black/5"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
