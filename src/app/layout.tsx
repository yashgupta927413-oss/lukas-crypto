import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

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
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b0e11] text-[#eaecef] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
