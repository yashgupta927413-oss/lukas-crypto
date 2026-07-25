import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lukas Financial | Digital Asset Options & Yield Platform",
  description: "Institutional digital asset options trading desk and structured quantitative yield vaults.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#f8fafc] text-[#0f172a] min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
