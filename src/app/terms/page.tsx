"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import { ShieldAlert, Scale, CheckCircle2, Lock } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold mb-3">
            <Scale className="w-4 h-4" />
            <span>TERMS & PLATFORM GOVERNANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Effective Date: January 2026 | Lukas Crypto Management Platform
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Lukas Crypto Management, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              2. 3-Wallet Isolation Rules & Capital Locks
            </h2>
            <p>
              Users acknowledge that capital transferred into the <strong>Bot Trading Wallet</strong> is locked for the duration of the chosen contract plan (30, 90, 180, or 365 days). Locked bot principal + daily yields cannot be withdrawn until maturity (`now() &gt;= endDate`).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              3. Binary Options Trading & Settlement
            </h2>
            <p>
              Binary options orders (1m, 5m, 15m, 30m, 1h, 4h, daily) execute at the strike price recorded at the time of trade placement using Binance live WebSocket tick prices. Payout multipliers (up to 80%) are configured by the global system parameters.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Read our Risk Disclosures for full market warnings.</span>
            <Link href="/risk-disclosure" className="text-amber-400 hover:underline font-bold">
              Risk Disclosure →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 font-mono">
        © {new Date().getFullYear()} Lukas Crypto Management. All rights reserved.
      </footer>
    </div>
  );
}
