"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AuthGuard } from "@/components/ui/AuthGuard";

export default function CartPage() {
  const { cartItems, totalItems, totalPrice, updateItem, removeItem, clearCart, loading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (!user) {
    return <AuthGuard icon="ðŸ›’" message="Please log in to view your cart." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <LoadingSkeleton count={3} height={120} />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <EmptyState icon="ðŸ›’" title="Your Cart is Empty" description="Discover our exclusive PAF collectibles" ctaText="Browse Collection" />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <PageHeader
        title="YOUR CART"
        maxWidth="max-w-5xl"
        subtitle={`${totalItems} ${totalItems === 1 ? "item" : "items"}`}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="card rounded-2xl p-5 flex gap-5 items-center">
                <Link href={`/products/${item.product_id}`}
                  className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: "#f1f5f9" }}>
                  {item.product?.images?.[0] ? (
                    <Image src={`${apiUrl}${item.product.images[0].url}`} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">âœˆ</div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_id}`}>
                    <h3 className="font-semibold text-sm hover:text-sky-500 transition-colors line-clamp-2"
                      style={{ color: "var(--text-primary)" }}>
                      {item.product?.name || `Product #${item.product_id}`}
                    </h3>
                  </Link>
                  {item.product?.size && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Size: {item.product.size}</p>
                  )}
                  <p className="text-sm font-black mt-1 text-gold-gradient">
                    PKR {Number(item.price).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <button onClick={() => updateItem(item.id, item.quantity - 1)}
                      className="px-4 py-3 text-sm transition-colors hover:bg-black/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{ color: "var(--text-muted)" }}>âˆ’</button>
                    <span className="px-3 py-3 text-sm font-bold min-w-[2.5rem] text-center"
                      style={{ color: "var(--text-primary)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="px-4 py-3 text-sm transition-colors hover:bg-black/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      style={{ color: "var(--text-muted)" }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button onClick={clearCart}
              className="text-xs tracking-widest transition-colors hover:text-red-400 mt-2"
              style={{ color: "var(--text-muted)" }}>
              CLEAR CART
            </button>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="card rounded-2xl p-6 sticky top-24">
              <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: "var(--gold)" }}>ORDER SUMMARY</h3>

              <div className="space-y-3 mb-5">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="line-clamp-1 mr-2" style={{ color: "var(--text-muted)" }}>
                      {item.product?.name || `Item`} Ã— {item.quantity}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>
                      PKR {(Number(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height: "1px", background: "var(--border)", marginBottom: 16 }} />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold tracking-wider text-sm" style={{ color: "var(--text-primary)" }}>TOTAL</span>
                <span className="text-2xl font-black text-gold-gradient">
                  PKR {totalPrice.toLocaleString()}
                </span>
              </div>

              <Link href="/checkout" className="btn-gold w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase text-center block">
                PROCEED TO CHECKOUT
              </Link>

              <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
                Secure payment via WhatsApp confirmation
              </p>

              <Link href="/products" className="block text-center text-xs tracking-widest mt-4 transition-colors hover:text-sky-500"
                style={{ color: "var(--text-muted)" }}>
                â† Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

