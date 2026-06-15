"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("orderRefNum") ?? searchParams.get("orderId") ?? "";
  const responseCode = searchParams.get("responseCode") ?? "9999";
  const responseDesc = searchParams.get("responseDesc") ?? searchParams.get("pp_ResponseMessage") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!orderRef) { setStatus("failed"); return; }
    api.payment.verifyEasypaisa(orderRef, responseCode)
      .then(res => {
        setOrderId(res.order_id);
        setStatus(res.success ? "success" : "failed");
      })
      .catch(() => {
        setStatus(responseCode === "0000" ? "success" : "failed");
      });
  }, [orderRef, responseCode]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm tracking-widest" style={{ color: "var(--text-muted)" }}>Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-md w-full card rounded-2xl p-10 text-center space-y-5">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>PAYMENT SUCCESSFUL</h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Your EasyPaisa payment has been received. Your order <strong>#{orderRef}</strong> is now being processed.
          </p>
          <div className="space-y-3 pt-2">
            {orderId && (
              <Link href={`/orders/${orderId}`}
                className="btn-gold block py-3 rounded-xl font-bold text-sm tracking-widest uppercase">
                View Order Details
              </Link>
            )}
            <Link href="/orders"
              className="block py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-colors hover:bg-black/5"
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              All My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-md w-full card rounded-2xl p-10 text-center space-y-5">
        <div className="text-6xl">❌</div>
        <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>PAYMENT FAILED</h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {responseDesc || "Your EasyPaisa payment could not be processed."} Please try again or contact support.
        </p>
        {orderRef && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Order Ref: {orderRef}</p>
        )}
        <div className="space-y-3 pt-2">
          <a href="https://wa.me/923207331147" target="_blank" rel="noopener noreferrer"
            className="btn-gold block py-3 rounded-xl font-bold text-sm tracking-widest uppercase">
            💬 Contact Support
          </a>
          <Link href="/cart"
            className="block py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-colors hover:bg-black/5"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <PaymentCallbackContent />
    </Suspense>
  );
}
