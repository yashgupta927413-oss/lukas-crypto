"use client";

import Link from "next/link";
import { Bot, ShieldCheck, Lock, Zap, Gift, Coins, ChevronRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs font-sans relative z-10 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  LUKAS<span className="text-sky-400"> CRYPTO</span>
                </span>
                <span className="block text-[9px] text-sky-400 font-mono tracking-widest uppercase font-bold">
                  MANAGEMENT PLATFORM
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Next-generation quantitative AI investment bots & 1m/5m binary options terminal. Powered by live Binance WebSocket tick feeds and an isolated 3-Wallet security model.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                BINANCE WEBSOCKET ONLINE
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                100% NON-CUSTODIAL
              </span>
            </div>
          </div>

          {/* Column 1: Platform Suite */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-400" />
              Trading Suite
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/dashboard" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition" />
                  Portfolio Dashboard
                </Link>
              </li>
              <li>
                <Link href="/bots" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition" />
                  AI Bot Investment Hub
                </Link>
              </li>
              <li>
                <Link href="/options" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition" />
                  1m & 5m Binary Options
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition" />
                  Admin Controls
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: AI Strategies */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-amber-400" />
              AI Yield Bots
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/bots" className="hover:text-white transition flex items-center justify-between text-slate-400">
                  <span>1 Month Bot</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">~0.50%/day</span>
                </Link>
              </li>
              <li>
                <Link href="/bots" className="hover:text-white transition flex items-center justify-between text-slate-400">
                  <span>3 Month Maximizer</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">~0.61%/day</span>
                </Link>
              </li>
              <li>
                <Link href="/bots" className="hover:text-white transition flex items-center justify-between text-slate-400">
                  <span>6 Month Pro</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">~0.72%/day</span>
                </Link>
              </li>
              <li>
                <Link href="/bots" className="hover:text-white transition flex items-center justify-between text-slate-400">
                  <span>1 Year Elite</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">~0.88%/day</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Legal & Support
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/risk-disclosure" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition" />
                  Risk Disclosure
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition" />
                  FAQ & Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition flex items-center gap-1 group">
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition" />
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Multi-Chain Badges Strip */}
        <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white font-sans">Supported Deposit Networks:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-sky-400 font-bold">USDT (TRC-20)</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">USDT/USDC (BEP-20)</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-bold">BTC (Native)</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-purple-400 font-bold">USDT/USDC (ERC-20)</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Lukas Crypto Management. All rights reserved.</p>
          <p className="max-w-md text-center md:text-right text-[9px] text-slate-600">
            Risk Warning: Trading binary options and cryptocurrency derivatives carries significant financial risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
