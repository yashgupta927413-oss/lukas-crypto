"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TradingViewChart from "@/components/tradingview-chart";
import {
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [liveBtcPrice, setLiveBtcPrice] = useState(94520.5);
  const [prices, setPrices] = useState<Record<string, { price: number; change24h: number }>>({
    BTCUSDT: { price: 94520.5, change24h: 3.42 },
    ETHUSDT: { price: 2785.1, change24h: -1.15 },
    SOLUSDT: { price: 198.4, change24h: 5.68 },
    XRPUSDT: { price: 2.45, change24h: 12.3 },
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/prices");
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
          if (data.BTCUSDT?.price) {
            setLiveBtcPrice(data.BTCUSDT.price);
          }
        }
      } catch (e) {
        console.error("Home prices error", e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 4000);
    return () => clearInterval(interval);
  }, []);

  const marketList = [
    { symbol: "BTCUSDT", name: "Bitcoin", pair: "BTC/USDT" },
    { symbol: "ETHUSDT", name: "Ethereum", pair: "ETH/USDT" },
    { symbol: "SOLUSDT", name: "Solana", pair: "SOL/USDT" },
    { symbol: "XRPUSDT", name: "Ripple", pair: "XRP/USDT" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Institutional Options Desk &amp; Earn Vaults</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Trade Crypto Options &amp; Earn Yields
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Execute 1-minute to 15-minute binary option contracts with 75% fixed payouts, or lock digital assets in structured quantitative yield vaults.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                href="/options"
                className="px-6 py-3.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Trade Options</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bots"
                className="px-6 py-3.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 transition-colors text-center shadow-xs"
              >
                <span>Earn Vaults</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 uppercase block font-sans text-[10px] font-semibold">Fixed Payout</span>
                <span className="text-slate-900 font-bold text-sm">75% Return</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 uppercase block font-sans text-[10px] font-semibold">Expirations</span>
                <span className="text-emerald-600 font-bold text-sm">1m / 5m / 15m</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 uppercase block font-sans text-[10px] font-semibold">Data Feed</span>
                <span className="text-blue-600 font-bold text-sm">Binance API</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Binance TradingView Chart */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex justify-between items-center px-1 text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-800">BTC/USDT Spot Index</span>
              <span className="text-slate-900 font-bold text-sm">${liveBtcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <TradingViewChart symbol="BTCUSDT" theme="light" />
          </div>
        </div>
      </section>

      {/* MARKETS SECTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-[#f8fafc]">
        <div className="max-w-[1600px] mx-auto space-y-5">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider font-mono">Markets</h2>
              <p className="text-xs text-slate-500">Live spot prices and binary option contracts</p>
            </div>
            <Link href="/options" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
              <span>All Markets</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Card List (< md screens) */}
          <div className="md:hidden space-y-3">
            {marketList.map((m) => {
              const data = prices[m.symbol] || { price: 0, change24h: 0 };
              const isUp = data.change24h >= 0;

              return (
                <div
                  key={m.symbol}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 font-mono text-xs shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-sans">{m.name}</span>
                      <span className="text-slate-400 text-[10px]">{m.pair}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold text-xs">
                        ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`font-bold text-[11px] ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
                        {isUp ? "+" : ""}{data.change24h}%
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/options?symbol=${m.symbol}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs font-sans transition-colors shrink-0 shadow-xs"
                  >
                    Trade →
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (>= md screens) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-sans font-bold">Trading Pair</th>
                  <th className="py-3.5 px-6 font-bold">Last Price</th>
                  <th className="py-3.5 px-6 font-bold">24h Change</th>
                  <th className="py-3.5 px-6 font-bold">Contract Expirations</th>
                  <th className="py-3.5 px-6 text-right font-sans font-bold">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marketList.map((m) => {
                  const data = prices[m.symbol] || { price: 0, change24h: 0 };
                  const isUp = data.change24h >= 0;

                  return (
                    <tr key={m.symbol} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                          <span className="text-slate-400 font-mono text-xs">{m.pair}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-bold text-sm">
                        ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
                          {isUp ? "+" : ""}{data.change24h}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        1m • 5m • 15m
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/options?symbol=${m.symbol}`}
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-xs transition-colors inline-block border border-blue-200"
                        >
                          Trade Options →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CORE PRODUCTS */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Trading &amp; Investment Solutions</h2>
            <p className="text-xs text-slate-500">
              Built for speed, transparency, and reliable execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold text-blue-600 uppercase">Derivatives</div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Digital Binary Options</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Predict price direction over short-term windows. Winning contracts automatically credit 75% profit returns directly to your trading account.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time Binance spot tick settlement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fixed 75% payout multiplier (1.75x)</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/options"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs text-center transition-colors shadow-sm block"
              >
                Launch Options Desk →
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold text-amber-600 uppercase">Structured Earn</div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Quantitative Yield Vaults</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Lock assets for 30 to 365 days in quantitative yield strategies. Daily yield compounds automatically into your vault balance.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Flexible term lengths (30, 90, 180, 365 Days)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automatic maturity unlock and release to Holding Wallet</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/bots"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs text-center transition-colors shadow-sm block"
              >
                Explore Yield Vaults →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about trading options and yield vaults.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How are option contracts settled?",
                a: "Contracts settle automatically based on the exact Binance spot index price at expiration. If the settlement price is in your chosen direction by even $0.01, you win a 75% profit payout.",
              },
              {
                q: "How does the $100 Welcome Bonus work?",
                a: "Every newly registered trader receives a $100 Welcome Bonus credit which can be combined with a $400 top-up to activate a $500 Minimum Yield Vault.",
              },
              {
                q: "Are deposits and withdrawals automated?",
                a: "Yes. Crypto deposits are processed instantly via automated NOWPayments gateway webhooks, crediting your Holding Account within seconds.",
              },
              {
                q: "How do segregated accounts work?",
                a: "Your capital is separated into 3 dedicated balances (Holding, Earn Vaults, Options Trading). You can transfer funds instantly between accounts with zero fees.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 font-sans">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
