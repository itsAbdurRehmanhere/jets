import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
          <p className="text-xs tracking-widest mb-2 uppercase" style={{ color: "var(--gold)" }}>Legal</p>
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            PRIVACY POLICY
          </h1>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>Last updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 space-y-8 text-sm leading-relaxed"
        style={{ color: "var(--text-muted)" }}>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Information We Collect</h2>
          <p>When you create an account or place an order, we collect your name, email address, phone number, and shipping address. We use this information solely to process and deliver your orders.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To process and fulfil your orders</li>
            <li>To send order confirmation and tracking updates</li>
            <li>To contact you via WhatsApp or email about your order</li>
            <li>To improve our website and services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Information Sharing</h2>
          <p>We do not sell, rent, or share your personal information with third parties, except as required to fulfil your order (e.g., sharing your address with our courier partner) or as required by law.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Data Security</h2>
          <p>Your account password is stored as a secure hash. We use HTTPS to encrypt data in transit. While we take reasonable precautions, no system is completely secure and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Cookies</h2>
          <p>Our website uses minimal cookies necessary for authentication and cart functionality. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Your Rights</h2>
          <p>You may request deletion of your account and associated personal data by contacting us. We will process deletion requests within 30 days.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Contact</h2>
          <p>Questions about this policy? Reach us at <a href="mailto:mabdurrehman089@gmail.com" className="hover:text-sky-500 transition-colors underline">mabdurrehman089@gmail.com</a>.</p>
        </section>

        <div className="pt-4 flex flex-wrap gap-4 text-xs">
          <Link href="/terms" className="hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>Terms of Service</Link>
          <Link href="/refund" className="hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
