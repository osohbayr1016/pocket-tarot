import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:"Pocket Tarot — Tarot, Astrology & Reflection",
  description:"Tarot-ын 78 карт, уламжлалт дэлгэмэл, ордын бэлгэдэл ба өөрийгөө эргэцүүлэх офлайн тооцоолол. AI/API шаардлагагүй.",
  robots: {index:true,follow:true},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="mn"><body className="antialiased">{children}</body></html>;
}
