import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
          <p className="text-xs tracking-widest mb-2 uppercase" style={{ color: "var(--gold)" }}>Legal</p>
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            TERMS OF SERVICE
          </h1>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>Last updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 space-y-8 text-sm leading-relaxed"
        style={{ color: "var(--text-muted)" }}>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>1. Acceptance of Terms</h2>
          <p>By placing an order or using the PAF Store website, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>2. Products & Pricing</h2>
          <p>All prices are listed in Pakistani Rupees (PKR). We reserve the right to change prices at any time without notice. Product images are for illustration purposes — actual products may vary slightly in colour or finish due to handcrafted nature.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>3. Orders & Payment</h2>
          <p>Orders are confirmed only after our team contacts you via WhatsApp. We reserve the right to cancel any order at our discretion. Currently, payment is collected via Cash on Delivery or bank transfer as arranged through WhatsApp.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>4. Shipping & Delivery</h2>
          <p>We ship across Pakistan. Delivery times are estimates and may vary based on your location and courier availability. PAF Store is not responsible for delays caused by courier services, natural disasters, or other events outside our control.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>5. Custom Orders</h2>
          <p>Custom and bulk orders are subject to separate agreements. A deposit may be required before production begins. Custom orders cannot be cancelled once production has started.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>6. Limitation of Liability</h2>
          <p>PAF Store is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific order in question.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>7. Contact</h2>
          <p>For questions, contact us at <a href="mailto:mabdurrehman089@gmail.com" className="hover:text-sky-500 transition-colors underline">mabdurrehman089@gmail.com</a> or via <a href="https://wa.me/923207331147" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors underline">WhatsApp</a>.</p>
        </section>

        <div className="pt-4 flex flex-wrap gap-4 text-xs">
          <Link href="/privacy" className="hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>Privacy Policy</Link>
          <Link href="/refund" className="hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
