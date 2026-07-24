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
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#2b313a]">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-5 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Trade Crypto Options &amp; Earn Yields
            </h1>

            <p className="text-sm text-[#848e9c] leading-relaxed">
              Execute 1-minute to 15-minute binary option contracts with 75% fixed payouts, or lock digital assets in structured quantitative yield vaults.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/options"
                className="px-6 py-3 rounded text-xs font-bold bg-[#f0b90b] text-[#0b0e11] hover:bg-[#d97706] transition-colors shadow flex items-center gap-2"
              >
                <span>Trade Options</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bots"
                className="px-6 py-3 rounded text-xs font-semibold bg-[#181a20] text-white hover:bg-[#1e2329] border border-[#2b313a] transition-colors"
              >
                <span>Earn Vaults</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2b313a] text-xs font-mono">
              <div>
                <span className="text-[#848e9c] uppercase block font-sans text-[10px]">Fixed Payout</span>
                <span className="text-white font-bold text-sm">75% Return</span>
              </div>
              <div>
                <span className="text-[#848e9c] uppercase block font-sans text-[10px]">Expirations</span>
                <span className="text-[#0ecb81] font-bold text-sm">1m / 5m / 15m</span>
              </div>
              <div>
                <span className="text-[#848e9c] uppercase block font-sans text-[10px]">Data Source</span>
                <span className="text-[#f0b90b] font-bold text-sm">Binance API</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Binance TradingView Chart */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex justify-between items-center px-1 text-xs font-mono text-[#848e9c]">
              <span className="font-semibold text-white">BTC/USDT Spot Index</span>
              <span className="text-white font-bold">${liveBtcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <TradingViewChart symbol="BTCUSDT" />
          </div>
        </div>
      </section>

      {/* MARKETS TABLE SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#2b313a] bg-[#07090b]">
        <div className="max-w-[1600px] mx-auto space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Markets</h2>
              <p className="text-xs text-[#848e9c]">Live spot prices and binary option contracts</p>
            </div>
            <Link href="/options" className="text-xs text-[#f0b90b] hover:underline font-semibold flex items-center gap-1">
              <span>All Markets</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-[#181a20] border border-[#2b313a] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b0e11] text-[#848e9c] uppercase text-[10px] border-b border-[#2b313a]">
                <tr>
                  <th className="py-3 px-6 font-sans">Trading Pair</th>
                  <th className="py-3 px-6">Last Price</th>
                  <th className="py-3 px-6">24h Change</th>
                  <th className="py-3 px-6">Contract Expirations</th>
                  <th className="py-3 px-6 text-right font-sans">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b313a]/50">
                {marketList.map((m) => {
                  const data = prices[m.symbol] || { price: 0, change24h: 0 };
                  const isUp = data.change24h >= 0;

                  return (
                    <tr key={m.symbol} className="hover:bg-[#1e2329] transition-colors">
                      <td className="py-3.5 px-6 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{m.name}</span>
                          <span className="text-[#848e9c] font-mono text-xs">{m.pair}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-white font-bold text-sm">
                        ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`font-bold ${isUp ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                          {isUp ? "+" : ""}{data.change24h}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-[#848e9c]">
                        1m • 5m • 15m
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link
                          href={`/options?symbol=${m.symbol}`}
                          className="px-3 py-1 bg-[#2b313a] hover:bg-[#474d57] text-[#f0b90b] font-bold rounded text-xs transition-colors inline-block"
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
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2b313a]">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white">Trading &amp; Investment Solutions</h2>
            <p className="text-xs text-[#848e9c]">
              Built for speed, transparency, and reliable execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#181a20] border border-[#2b313a] rounded-lg p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-[#f0b90b] uppercase">Derivatives</div>
                <h3 className="text-xl font-bold text-white">Digital Binary Options</h3>
                <p className="text-xs text-[#848e9c] leading-relaxed">
                  Predict price direction over short-term windows. Winning contracts automatically credit 75% profit returns directly to your trading account.
                </p>

                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0ecb81]" />
                    <span>Real-time Binance spot tick settlement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0ecb81]" />
                    <span>Fixed 75% payout multiplier (1.75x)</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/options"
                className="w-full py-2.5 bg-[#2b313a] hover:bg-[#474d57] text-white font-bold rounded text-xs text-center transition-colors block"
              >
                Launch Options Desk →
              </Link>
            </div>

            <div className="bg-[#181a20] border border-[#2b313a] rounded-lg p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-[#38bdf8] uppercase">Structured Earn</div>
                <h3 className="text-xl font-bold text-white">Quantitative Yield Vaults</h3>
                <p className="text-xs text-[#848e9c] leading-relaxed">
                  Lock assets for 30 to 365 days in quantitative yield strategies. Daily yield compounds automatically into your vault balance.
                </p>

                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0ecb81]" />
                    <span>Flexible term lengths (30, 90, 180, 365 Days)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0ecb81]" />
                    <span>Automatic maturity unlock and release</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/bots"
                className="w-full py-2.5 bg-[#2b313a] hover:bg-[#474d57] text-white font-bold rounded text-xs text-center transition-colors block"
              >
                Explore Yield Vaults →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2b313a] bg-[#07090b]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-[#848e9c]">Everything you need to know about trading options and yield vaults.</p>
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
              <div key={idx} className="bg-[#181a20] border border-[#2b313a] rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-bold text-white font-sans">{faq.q}</h4>
                <p className="text-xs text-[#848e9c] leading-relaxed font-sans">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
