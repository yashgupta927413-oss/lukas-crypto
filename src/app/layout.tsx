import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Lukas Crypto Management - AI Bot Investment & Options Trading Platform",
  description: "High-frequency algorithmic trading bots and 1m/5m binary options platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
