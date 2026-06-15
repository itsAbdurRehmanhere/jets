import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "PAF Store — Air Force Collectibles & Models",
  description:
    "Premium fighter jet models, sculptures, trophies and air force memorabilia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} w-full h-full antialiased`}>
      <body className="w-full min-h-full flex flex-col" style={{ background: "var(--bg-primary)" }}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="w-full flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
