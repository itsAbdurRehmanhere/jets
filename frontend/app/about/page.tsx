import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* Hero */}
      <section className="py-24 md:py-36 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #04182e 0%, #075985 60%, #04182e 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url('/thunder.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(4,24,46,0.6) 0%, rgba(4,24,46,0.85) 100%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p className="text-xs tracking-widest mb-4 uppercase" style={{ color: "#38bdf8" }}>Our Story</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6" style={{ color: "#f0f9ff" }}>
            ABOUT PAF STORE
          </h1>
          <div className="divider-gold mx-auto mb-6" />
          <p className="text-base md:text-lg leading-relaxed" style={{ color: "#bae6fd" }}>
            Official collectibles celebrating the pride, precision, and heritage of the Pakistan Air Force.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: "var(--bg-secondary)" }} className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--gold)" }}>Who We Are</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: "var(--text-primary)" }}>
                CRAFTED WITH PRIDE
              </h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>
                  PAF Store is the official home of Pakistan Air Force collectibles — handcrafted replicas,
                  precision sculptures, engraved shields, and premium memorabilia that honour aviation excellence.
                </p>
                <p>
                  Every piece in our collection is created with meticulous attention to detail, capturing the
                  spirit of legendary aircraft like the JF-17 Thunder, F-16 Fighting Falcon, J-10C, and Mirage III.
                </p>
                <p>
                  Whether you are an aviation enthusiast, a PAF veteran, or searching for a distinguished gift,
                  our store offers products that carry real meaning and lasting craftsmanship.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎖", title: "AUTHENTICITY", desc: "Every product is officially sanctioned and precision-crafted to honour PAF heritage." },
                { icon: "✈", title: "QUALITY", desc: "Premium materials — crystal, die-cast metal, sterling silver — no shortcuts." },
                { icon: "🏆", title: "RECOGNITION", desc: "Trophies, shields, and plaques trusted by PAF units and squadrons nationwide." },
                { icon: "📦", title: "DELIVERY", desc: "Secure packaging and tracked shipping across all of Pakistan." },
              ].map(f => (
                <div key={f.title} className="card rounded-2xl p-5 flex flex-col gap-3">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="text-xs font-bold tracking-widest" style={{ color: "var(--gold)" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ background: "var(--bg-primary)" }} className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--gold)" }}>Get in Touch</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>CONTACT US</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: "💬",
                title: "WhatsApp",
                info: "+92 320 7331147",
                href: "https://wa.me/923207331147",
                label: "Chat Now",
              },
              {
                icon: "📧",
                title: "Email",
                info: "pafstore@example.pk",
                href: "mailto:pafstore@example.pk",
                label: "Send Email",
              },
              {
                icon: "🕐",
                title: "Hours",
                info: "Mon–Sat · 9 AM – 7 PM",
                href: null,
                label: null,
              },
            ].map(c => (
              <div key={c.title} className="card rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <div className="text-4xl">{c.icon}</div>
                <h3 className="font-bold tracking-widest text-xs" style={{ color: "var(--gold)" }}>{c.title}</h3>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.info}</p>
                {c.href && (
                  <a href={c.href} target="_blank" rel="noopener noreferrer"
                    className="btn-gold px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase">
                    {c.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Custom order CTA */}
          <div className="rounded-2xl p-8 md:p-10 text-center"
            style={{ background: "linear-gradient(135deg, #e0f2fe, #bae6fd)", border: "1px solid #bfdbfe" }}>
            <div className="text-4xl mb-4">✈</div>
            <h3 className="text-2xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
              NEED A CUSTOM ORDER?
            </h3>
            <p className="text-sm leading-relaxed mb-6 max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
              Looking for a specific jet model, a custom engraved trophy, or bulk corporate gifting?
              Contact us on WhatsApp and we will work with you directly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/923207331147" target="_blank" rel="noopener noreferrer"
                className="btn-gold px-10 py-3 rounded-xl text-sm font-bold tracking-widest uppercase">
                💬 WhatsApp Us
              </a>
              <Link href="/products"
                className="px-10 py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-sky-100"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
