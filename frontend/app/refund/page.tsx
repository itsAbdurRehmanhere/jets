import Link from "next/link";

export default function RefundPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
          <p className="text-xs tracking-widest mb-2 uppercase" style={{ color: "var(--gold)" }}>Legal</p>
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            REFUND & RETURN POLICY
          </h1>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>Last updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 space-y-8 text-sm leading-relaxed"
        style={{ color: "var(--text-muted)" }}>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Returns</h2>
          <p>We accept returns within <strong style={{ color: "var(--text-primary)" }}>7 days</strong> of delivery, provided the product is unused and in its original packaging. To initiate a return, contact us on WhatsApp with your order number and photos of the item.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Damaged or Defective Items</h2>
          <p>If your item arrives damaged or defective, please contact us within <strong style={{ color: "var(--text-primary)" }}>48 hours</strong> of delivery with photos. We will arrange a replacement or full refund at no cost to you.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Non-Returnable Items</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Custom or personalised orders (engraved items, custom models)</li>
            <li>Items that have been used, assembled, or modified</li>
            <li>Items returned without prior approval</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Order Cancellation</h2>
          <p>Orders can be cancelled before they are processed or shipped. Once an order is shipped, cancellation is no longer possible — the return process applies instead. To cancel, use the "Cancel Order" button on your order page or contact us via WhatsApp immediately.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Refund Process</h2>
          <p>Approved refunds are processed within <strong style={{ color: "var(--text-primary)" }}>5–7 business days</strong> via bank transfer or EasyPaisa (when available). Return shipping costs are the responsibility of the customer unless the item was defective.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Contact Us</h2>
          <p>To initiate a return or refund, contact our team:</p>
          <div className="mt-3 space-y-2">
            <p>
              <a href="https://wa.me/923207331147" target="_blank" rel="noopener noreferrer"
                className="hover:text-sky-500 transition-colors underline">WhatsApp: +92 320 7331147</a>
            </p>
            <p>
              <a href="mailto:mabdurrehman089@gmail.com"
                className="hover:text-sky-500 transition-colors underline">mabdurrehman089@gmail.com</a>
            </p>
          </div>
        </section>

        <div className="pt-4 flex flex-wrap gap-4 text-xs">
          <Link href="/terms" className="hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>Terms of Service</Link>
          <Link href="/privacy" className="hover:text-sky-500 transition-colors" style={{ color: "var(--gold)" }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
