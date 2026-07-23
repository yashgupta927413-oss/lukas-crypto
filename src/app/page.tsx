"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TradingViewChart from "@/components/tradingview-chart";
import {
  TrendingUp,
  Vault,
  Shield,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Lock,
  Globe,
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
    { symbol: "BTCUSDT", name: "Bitcoin", pair: "BTC/USDT", category: "Layer 1" },
    { symbol: "ETHUSDT", name: "Ethereum", pair: "ETH/USDT", category: "Layer 1" },
    { symbol: "SOLUSDT", name: "Solana", pair: "SOL/USDT", category: "Layer 1" },
    { symbol: "XRPUSDT", name: "Ripple", pair: "XRP/USDT", category: "Payment" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#1f2430]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#121620] border border-[#1f2430] text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#0ecb81]"></span>
              <span>Binance Market Data Integration</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Crypto Options &amp; Yield Vaults Platform
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Trade short-term crypto binary options with 75% fixed payouts or allocate funds into structured quantitative yield vaults.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/options"
                className="px-6 py-3 rounded-xl font-bold text-xs bg-[#f0b90b] text-[#0b0e14] hover:bg-[#d97706] transition-colors shadow flex items-center gap-2"
              >
                <span>Open Options Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bots"
                className="px-6 py-3 rounded-xl font-semibold text-xs bg-[#181e2b] text-slate-200 hover:bg-[#232a3a] border border-[#2b3548] transition-colors flex items-center gap-2"
              >
                <Vault className="w-4 h-4 text-[#f0b90b]" />
                <span>Explore Yield Vaults</span>
              </Link>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1f2430] text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase block font-sans text-[10px]">Fixed Payout</span>
                <span className="text-white font-bold text-base">75% Return</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block font-sans text-[10px]">Expirations</span>
                <span className="text-[#0ecb81] font-bold text-base">1m / 5m / 15m</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block font-sans text-[10px]">Welcome Bonus</span>
                <span className="text-[#f0b90b] font-bold text-base">$100 USD</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Official Binance Chart */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex justify-between items-center px-1 text-xs font-mono text-slate-400">
              <span className="font-semibold text-slate-300">BTC/USDT Real-Time Market</span>
              <span className="text-white font-bold">${liveBtcPrice.toLocaleString()}</span>
            </div>

            <TradingViewChart symbol="BTCUSDT" />
          </div>
        </div>
      </section>

      {/* MARKETS TABLE SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#1f2430] bg-[#07090e]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold text-white">Market Overview</h2>
              <p className="text-xs text-slate-400">Real-time cryptocurrency prices from spot exchanges</p>
            </div>
            <Link href="/options" className="text-xs text-[#38bdf8] hover:underline font-semibold flex items-center gap-1">
              <span>Go to Trading Desk</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-[#121620] border border-[#1f2430] rounded-2xl overflow-hidden shadow">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b0e14] text-slate-400 uppercase text-[10px] border-b border-[#1f2430]">
                <tr>
                  <th className="py-3.5 px-6 font-sans">Asset</th>
                  <th className="py-3.5 px-6">Last Price</th>
                  <th className="py-3.5 px-6">24h Change</th>
                  <th className="py-3.5 px-6">Available Expirations</th>
                  <th className="py-3.5 px-6 text-right font-sans">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2430]">
                {marketList.map((m) => {
                  const data = prices[m.symbol] || { price: 0, change24h: 0 };
                  const isUp = data.change24h >= 0;

                  return (
                    <tr key={m.symbol} className="hover:bg-[#181e2b]/60 transition-colors">
                      <td className="py-4 px-6 font-sans">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-sm">{m.name}</span>
                          <span className="text-slate-400 font-mono text-xs">{m.pair}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white font-bold text-sm">
                        ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold ${isUp ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                          {isUp ? "+" : ""}{data.change24h}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        1m • 5m • 15m
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/options?symbol=${m.symbol}`}
                          className="px-3.5 py-1.5 bg-[#181e2b] hover:bg-[#232a3a] text-[#f0b90b] font-bold rounded-lg border border-[#2b3548] text-xs transition-colors inline-block"
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

      {/* PRODUCTS OVERVIEW */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#1f2430]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Financial Products</h2>
            <p className="text-xs text-slate-400">
              Transparent, execution-focused tools designed for traders and capital allocators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product 1: Options */}
            <div className="bg-[#121620] border border-[#1f2430] rounded-2xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#f0b90b]/10 border border-[#f0b90b]/30 flex items-center justify-center text-[#f0b90b]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Digital Binary Options Desk</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Execute short-term CALL or PUT options across major crypto pairs. Receive a fixed 75% payout upon winning settlement.
                </p>

                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" />
                    <span>Real-time Binance spot tick settlement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" />
                    <span>Fixed 1.75x payout multiplier on winning trades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" />
                    <span>Automated payout credit to trading account</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/options"
                className="w-full py-3 bg-[#181e2b] hover:bg-[#232a3a] text-white font-bold rounded-xl text-xs text-center border border-[#2b3548] transition-colors block"
              >
                Launch Options Desk →
              </Link>
            </div>

            {/* Product 2: Yield Vaults */}
            <div className="bg-[#121620] border border-[#1f2430] rounded-2xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                  <Vault className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Quantitative Yield Vaults</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Commit principal to structured yield strategies for 30 to 365 days. Daily earnings accrue directly to your vault balance.
                </p>

                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" />
                    <span>Structured duration tiers (30, 90, 180, 365 Days)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" />
                    <span>$100 Welcome trial credit allocation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" />
                    <span>Automatic maturity release to main balance</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/bots"
                className="w-full py-3 bg-[#181e2b] hover:bg-[#232a3a] text-white font-bold rounded-xl text-xs text-center border border-[#2b3548] transition-colors block"
              >
                View Yield Vaults →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEGREGATED ACCOUNT MODEL */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#1f2430] bg-[#07090e]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white">Segregated Account Model</h2>
            <p className="text-xs text-slate-400">
              Clear capital segregation between deposits, active investments, and trading balances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121620] border border-[#1f2430] p-6 rounded-2xl space-y-3">
              <div className="text-[10px] font-mono font-bold text-[#38bdf8] uppercase">Account 1</div>
              <h4 className="text-base font-bold text-white">Holding Account</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Main account for crypto deposits and withdrawals. Funds remain unencumbered and liquid.
              </p>
            </div>

            <div className="bg-[#121620] border border-[#1f2430] p-6 rounded-2xl space-y-3">
              <div className="text-[10px] font-mono font-bold text-[#f0b90b] uppercase">Account 2</div>
              <h4 className="text-base font-bold text-white">Yield Vault Account</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Capital allocated to active yield plans. Unlocked automatically upon term maturity.
              </p>
            </div>

            <div className="bg-[#121620] border border-[#1f2430] p-6 rounded-2xl space-y-3">
              <div className="text-[10px] font-mono font-bold text-[#0ecb81] uppercase">Account 3</div>
              <h4 className="text-base font-bold text-white">Options Account</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated margin balance for opening and settling short-term binary option contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
