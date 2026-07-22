"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import { AlertTriangle, TrendingDown, ShieldAlert, Zap } from "lucide-react";

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-slate-900 to-amber-500/10 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>MANDATORY RISK WARNING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Risk Disclosure & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            High-Frequency Algorithmic Bot & Binary Options Trading Involves Significant Financial Risk.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              1. Market Volatility Warning
            </h2>
            <p>
              Digital asset trading carries high exposure to cryptocurrency market volatility. Prices can fluctuate rapidly due to global liquidity shifts, exchange order flows, and macroeconomic events.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              2. Binary Options Short-Term Risks
            </h2>
            <p>
              Trading 1-minute and 5-minute binary options involves rapid capital stake exposure. Past performance of Binance price feeds does not guarantee future results. You should never trade with funds you cannot afford to lose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-sky-400" />
              3. AI Algorithmic Bot Projections
            </h2>
            <p>
              Estimated daily ROI percentages (`~0.50%/day` to `~0.88%/day`) are simulated metrics based on historical strategy data. Daily profit log injections posted by the Admin Panel are subject to bot contract maturity rules.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Have questions about risk management?</span>
            <Link href="/faq" className="text-sky-400 hover:underline font-bold">
              Read Platform FAQ →
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
