"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { HelpCircle, ChevronDown, ChevronUp, Bot, ShieldCheck, Gift, TrendingUp, Wallet } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the $100 Free Trial Credit work?",
      a: "Every new account automatically receives a $100 Free Trial Credit allocation. You can apply this $100 credit toward activating your first AI Bot Contract alongside a minimum $400 top-up from your Holding Wallet to meet the $500 minimum principal threshold.",
    },
    {
      q: "What is the 3-Wallet Isolation Security Model?",
      a: "Your capital is separated into 3 distinct financial wallets: 1) Holding Wallet for free liquidity & withdrawals, 2) Bot Trading Wallet for locked bot principal + daily yields, and 3) Personal Options Wallet for binary options stakes. Funds are never commingled.",
    },
    {
      q: "How are daily bot profits calculated and injected?",
      a: "Daily profits are updated daily via the Admin Panel into active user contracts. Each daily injection logs an explicit BotYieldLog entry detailing the date, daily ROI percentage (+X% Daily), and dollar profit amount.",
    },
    {
      q: "Are deposits and withdrawals 100% KYC-Free?",
      a: "Yes! Lukas Crypto Management supports non-custodial crypto deposits and withdrawals (USDT TRC-20, BEP-20, BTC Native) directly to and from your private wallet without identity verification checks.",
    },
    {
      q: "Where does the price data for 1m/5m Binary Options come from?",
      a: "All binary options charts and strike settlements stream live real-time price ticks directly from Binance WebSocket & REST API mirrors (`BTCUSDT`, `ETHUSDT`, `SOLUSDT`, `XRPUSDT`, `DOGEUSDT`, `BNBUSDT`).",
    },
    {
      q: "When can I withdraw my bot contract funds?",
      a: "Bot contract principal + accumulated daily yields are locked until contract maturity (`now() >= endDate`). Once the lock period expires, you can claim your total payout directly into your Holding Wallet with one click.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>KNOWLEDGEBASE & HELP CENTER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Everything you need to know about Lukas Crypto Management, the 3-Wallet model, $100 Trial Credit, and 1m/5m Binary Options.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition"
                >
                  <span className="text-sm font-bold text-white">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4">
          <h3 className="text-lg font-bold text-white">Still have questions?</h3>
          <p className="text-xs text-slate-400">Our support team is ready to assist you 24/7.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-sky-500/20"
          >
            Contact Support Team
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#2b313a] py-6 text-center text-xs text-[#848e9c] font-mono">
        © {new Date().getFullYear()} Lukas Financial Ltd. All rights reserved.
      </footer>
    </div>
  );
}
