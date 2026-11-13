import type { Metadata } from "next";
import "./globals.css";
import OfflineRegistration from "./components/OfflineRegistration";
import {LanguageProvider} from "./lib/LanguageProvider";
export const metadata: Metadata = {
  title:"Pocket Tarot — Tarot, Astrology & Reflection",
  description:"Tarot-ын 78 карт, уламжлалт дэлгэмэл, ордын бэлгэдэл ба өөрийгөө эргэцүүлэх офлайн тооцоолол. AI/API шаардлагагүй.",
  robots: {index:true,follow:true},
  manifest:"/manifest.webmanifest",
  icons: {icon:"/icon.svg",apple:"/icon.svg"},
  appleWebApp: {capable:true,title:"Pocket Tarot",statusBarStyle:"black-translucent"},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="mn"><body className="antialiased"><LanguageProvider><OfflineRegistration/>{children}</LanguageProvider></body></html>;
}
