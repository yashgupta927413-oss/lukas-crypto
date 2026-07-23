"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TradingViewChart from "@/components/tradingview-chart";
import {
  TrendingUp,
  Bot,
  Shield,
  ArrowRight,
  Zap,
  Lock,
  BarChart3,
  CheckCircle,
  Coins,
  ChevronRight,
  Globe,
  Layers,
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

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121722] border border-[#1e2638] text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#0ecb81]"></span>
              <span>Binance WebSocket Tick Settlement Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Institutional <span className="text-[#f0b90b]">Crypto Options</span> &amp; Quant AI Yields
            </h1>

            <p className="text-base text-slate-400 leading-relaxed max-w-xl">
              Execute high-precision 1m and 5m binary option contracts with 75% fixed payout ratios, or deploy automated quantitative AI trading bots for daily compound returns.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/options"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#f0b90b] text-[#0b0e14] hover:bg-[#d97706] transition-all shadow-lg flex items-center gap-2"
              >
                <span>Trade Options Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bots"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#1a2130] text-slate-200 hover:bg-[#232c40] border border-[#2b374e] transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-[#f0b90b]" />
                <span>Explore AI Quant Bots</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1e2638] text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase block font-sans text-[10px]">Options Payout</span>
                <span className="text-white font-black text-lg">75.0% Fixed</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block font-sans text-[10px]">Settlement Time</span>
                <span className="text-[#0ecb81] font-black text-lg">1m / 5m</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block font-sans text-[10px]">Trial Bonus</span>
                <span className="text-[#f0b90b] font-black text-lg">$100 USD</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Official Binance TradingView Chart */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex justify-between items-center px-1 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0ecb81]"></span>
                <span>BTC/USDT Live Chart</span>
              </span>
              <span className="text-slate-200 font-bold">${liveBtcPrice.toLocaleString()}</span>
            </div>

            <TradingViewChart symbol="BTCUSDT" height={420} />
          </div>
        </div>
      </section>

      {/* MARKETS PREVIEW GRID */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#1e2638] bg-[#07090f]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Live Cryptocurrency Markets</h2>
              <p className="text-xs text-slate-400">Real-time prices sourced directly from Binance orderbooks</p>
            </div>
            <Link href="/options" className="text-xs text-[#38bdf8] hover:underline font-semibold flex items-center gap-1">
              <span>View All Trading Pairs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(prices).map(([symbol, data]) => {
              const pairName = symbol.replace("USDT", "/USDT");
              const isUp = data.change24h >= 0;
              return (
                <Link
                  key={symbol}
                  href={`/options?symbol=${symbol}`}
                  className="bg-[#121722] hover:bg-[#192233] border border-[#1e2638] hover:border-[#2b374e] p-5 rounded-2xl transition-all space-y-3 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-bold text-white group-hover:text-[#f0b90b] transition-colors">{pairName}</span>
                      <span className="text-[10px] text-slate-500 block font-mono uppercase">Spot Index</span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isUp ? "bg-[#0ecb81]/10 text-[#0ecb81]" : "bg-[#f6465d]/10 text-[#f6465d]"}`}>
                      {isUp ? "+" : ""}{data.change24h}%
                    </span>
                  </div>

                  <div className="text-xl font-black font-mono text-white">
                    ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-2 border-t border-[#1e2638]/60">
                    <span>1m/5m Options</span>
                    <span className="text-[#38bdf8] font-bold">Trade →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE PLATFORM OFFERINGS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-white">Engineered for Precision &amp; Yield</h2>
            <p className="text-sm text-slate-400">
              Two powerful investment vehicles built on transparent smart contracts and Binance price feeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Options Trading */}
            <div className="bg-[#121722] border border-[#1e2638] rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0b90b]/10 border border-[#f0b90b]/30 flex items-center justify-center text-[#f0b90b]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">1m &amp; 5m Binary Options Desk</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Predict market direction (CALL or PUT) over ultra-short timeframes. If the settlement price confirms your direction by even 1 cent, receive an instant 75% profit return credited directly to your trading wallet.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0ecb81]" />
                    <span>Exact Binance WebSocket tick settlement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0ecb81]" />
                    <span>Fixed 75% payout multiplier (1.75x)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0ecb81]" />
                    <span>Automated win/loss resolution algorithm</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/options"
                className="w-full py-3.5 bg-[#192233] hover:bg-[#232c40] text-white font-bold rounded-xl text-xs text-center border border-[#2b374e] transition-colors block"
              >
                Launch Options Trading Desk →
              </Link>
            </div>

            {/* Feature 2: AI Quant Bots */}
            <div className="bg-[#121722] border border-[#1e2638] rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Automated AI Quantitative Bots</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Lock principal into automated AI arbitrage and market-making quantitative strategies. Receive daily compounding yield logs credited straight into your Bot Balance.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0ecb81]" />
                    <span>Flexible lock periods: 30 to 365 Days</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0ecb81]" />
                    <span>Claim $100 Trial Bonus upon registration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0ecb81]" />
                    <span>Automatic profit distribution &amp; maturity release</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/bots"
                className="w-full py-3.5 bg-[#192233] hover:bg-[#232c40] text-white font-bold rounded-xl text-xs text-center border border-[#2b374e] transition-colors block"
              >
                View Quant Bot Plans →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ISOLATED 3-WALLET ARCHITECTURE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#1e2638] bg-[#07090f]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-white">3-Wallet Security Architecture</h2>
            <p className="text-sm text-slate-400">
              Keep your capital segregated. Transfer funds instantly between wallets without fees or delay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121722] border border-[#1e2638] p-6 rounded-2xl space-y-3">
              <div className="text-xs font-mono font-bold text-[#38bdf8] uppercase">Wallet 1</div>
              <h4 className="text-lg font-bold text-white">Holding Wallet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your main vault for depositing and withdrawing non-custodial crypto (USDT, BTC, ETH, SOL).
              </p>
            </div>

            <div className="bg-[#121722] border border-[#1e2638] p-6 rounded-2xl space-y-3">
              <div className="text-xs font-mono font-bold text-[#f0b90b] uppercase">Wallet 2</div>
              <h4 className="text-lg font-bold text-white">Bot Investment Wallet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Capital allocated to active AI Quant Bot plans for daily automated yield generation.
              </p>
            </div>

            <div className="bg-[#121722] border border-[#1e2638] p-6 rounded-2xl space-y-3">
              <div className="text-xs font-mono font-bold text-[#0ecb81] uppercase">Wallet 3</div>
              <h4 className="text-lg font-bold text-white">Personal Options Wallet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated trading balance for staking 1m and 5m binary option trades with instant settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
