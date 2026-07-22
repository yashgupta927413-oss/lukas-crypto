"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LiveTradingChart from "@/components/live-trading-chart";
import Footer from "@/components/footer";
import {
  Bot,
  TrendingUp,
  ShieldCheck,
  Zap,
  Gift,
  ArrowRight,
  Sparkles,
  Coins,
  BadgeCheck,
  Menu,
  X,
  User,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  const [prices, setPrices] = useState<Record<string, { price: number; change24h: number }>>({
    BTCUSDT: { price: 94520.5, change24h: 3.42 },
    ETHUSDT: { price: 2785.1, change24h: -1.15 },
    SOLUSDT: { price: 198.4, change24h: 5.68 },
    XRPUSDT: { price: 2.45, change24h: 12.3 },
  });

  const [liveBtcPrice, setLiveBtcPrice] = useState<number>(94520.5);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [yieldCalcAmount, setYieldCalcAmount] = useState<number>(1000);
  const [calcTierDays, setCalcTierDays] = useState<number>(30);

  // Live WebSocket for BTC
  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.p) {
        setLiveBtcPrice(parseFloat(msg.p));
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/prices");
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 4000);
    return () => clearInterval(interval);
  }, []);

  const getRoiRate = (days: number) => {
    if (days === 30) return 0.15;
    if (days === 90) return 0.55;
    if (days === 180) return 1.3;
    return 3.2;
  };

  const estimatedProfit = yieldCalcAmount * getRoiRate(calcTierDays);
  const totalReturn = yieldCalcAmount + estimatedProfit;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Cyber Grid Overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0"></div>

      {/* Top Live Ticker Strip */}
      <div className="bg-slate-950/95 border-b border-slate-800/80 text-xs py-2 px-4 flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-8 text-slate-300 relative z-20">
        <div className="flex items-center gap-2 font-bold text-sky-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <Coins className="w-3.5 h-3.5" />
          <span className="tracking-wider uppercase">BINANCE LIVE TICK STREAM:</span>
        </div>
        {Object.entries(prices).map(([symbol, data]) => (
          <div key={symbol} className="flex items-center gap-2.5 font-mono">
            <span className="text-slate-400 font-sans font-medium">{symbol.replace("USDT", "")}/USDT</span>
            <span className="font-bold text-white">${data.price.toLocaleString()}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                data.change24h >= 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {data.change24h >= 0 ? "+" : ""}
              {data.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#features" className="hover:text-sky-400 transition">
              Core Features
            </a>
            <a href="#bots" className="hover:text-sky-400 transition">
              AI Investment Bots
            </a>
            <a href="#wallets" className="hover:text-sky-400 transition">
              3-Wallet Isolation
            </a>
            <a href="#calculator" className="hover:text-sky-400 transition">
              Yield Calculator
            </a>
            <Link href="/options" className="hover:text-sky-400 transition">
              1m/5m Options
            </Link>
          </nav>

          {/* SINGLE LOGIN / APP BUTTON */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 text-xs font-black bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-lg shadow-sky-500/30 transition flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <User className="w-4 h-4" />
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 text-xs font-black bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 rounded-xl shadow-lg shadow-sky-500/30 transition flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 font-bold text-xs uppercase tracking-wider">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-sky-400"
            >
              Core Features
            </a>
            <a
              href="#bots"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-sky-400"
            >
              AI Investment Bots
            </a>
            <a
              href="#wallets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-sky-400"
            >
              3-Wallet Isolation
            </a>
            <a
              href="#calculator"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-sky-400"
            >
              Yield Calculator
            </a>
            <Link
              href="/options"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sky-400 hover:text-sky-300"
            >
              1m/5m Options Terminal
            </Link>

            <div className="pt-3 border-t border-slate-800">
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-slate-950 bg-sky-500 rounded-xl font-black"
                >
                  Launch Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center text-slate-950 bg-sky-500 rounded-xl font-black"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold shadow-lg shadow-sky-500/10">
                <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
                <span>CLAIM $100 FREE TRIAL CREDIT ON SIGNUP</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Next-Gen Algorithmic <br />
                <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  AI Investment Bots & 1m/5m Binary Options
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Deploy high-frequency algorithmic yield bots with guaranteed daily returns, trade 1-minute & 5-minute binary options backed by live Binance price feeds, and protect your capital with an isolated 3-Wallet model.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href={session ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-sky-500/30 transition flex items-center justify-center gap-2.5 group uppercase tracking-wider"
                >
                  <Gift className="w-5 h-5 text-slate-950" />
                  <span>{session ? "Go to Dashboard" : "Sign In & Claim $100 Trial"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/options"
                  className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Live 1m/5m Terminal</span>
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">3-Wallet Isolation</span>
                    <span className="text-[10px] text-slate-400">Strict Capital Locks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Binance WebSocket</span>
                    <span className="text-[10px] text-slate-400">Live Ticks Stream</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <BadgeCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Daily ROI Logs</span>
                    <span className="text-[10px] text-slate-400">Unwithdrawable Audit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column REAL BTC LIVE CRYPTO RATE CHART */}
            <div className="lg:col-span-6 relative">
              <div className="glass-panel-cyan p-6 sm:p-7 rounded-3xl border border-sky-500/30 shadow-2xl shadow-sky-500/10 space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                    <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                      BTC/USDT REAL-TIME LIVE CRYPTO RATE
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20 font-mono">
                    BINANCE WEBSOCKET
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      ${liveBtcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono ml-3 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +3.42% 24h
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                    Market Cap: <strong className="text-slate-200">$1.86T</strong>
                  </span>
                </div>

                {/* Real Live Chart Stream Component */}
                <LiveTradingChart
                  symbol="BTCUSDT"
                  livePrice={liveBtcPrice}
                  height={240}
                />

                {/* Live Stats Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">24h High</span>
                    <strong className="text-emerald-400 font-bold">$95,800.00</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">24h Low</span>
                    <strong className="text-rose-400 font-bold">$93,200.00</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">24h Vol</span>
                    <strong className="text-sky-400 font-bold">$28.4B</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS COUNTER BAR */}
      <section className="py-8 bg-slate-900/60 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="text-3xl font-black text-sky-400 font-mono block">$48.2M+</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Trading Volume</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-black text-emerald-400 font-mono block">80%</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Max Options Payout Rate</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-black text-amber-400 font-mono block">14,200+</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active AI Bot Traders</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-black text-indigo-400 font-mono block">99.98%</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Uptime SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PILLARS SECTION */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              UNRIVALED PLATFORM ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              The 4 Pillars of Lukas Crypto Management
            </h2>
            <p className="text-sm text-slate-400">
              Automated quantitative bot growth alongside high-speed binary options trading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 1 */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Bot Investment Hub</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quantitative strategies with guaranteed minimum ROI tiers (15% to 320%). Daily profit injections calculated automatically and locked until contract maturity.
                </p>
              </div>
              <Link href="/bots" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Explore Bot Plans <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2 */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">1m & 5m Options Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trade short-term price movements across BTC, ETH, SOL, XRP, DOGE & BNB. Live Binance price feeds, instant strike capture, and up to 80% win payouts.
                </p>
              </div>
              <Link href="/options" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Open Options Terminal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3 */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">3-Wallet Isolation Model</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Holding Wallet (free liquidity), Bot Wallet (locked principal + yields), and Personal Options Wallet (dedicated to options). Funds are never commingled.
                </p>
              </div>
              <a href="#wallets" className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                View Wallet Breakdown <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 4 */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl border border-slate-800 space-y-4 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Dynamic Admin Panel</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time operational parameter controls: configure bot tiers, set binary win payout multipliers, execute daily profit injections, and manage user payout requests.
                </p>
              </div>
              <Link href="/admin" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Admin Controls <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-WALLET ISOLATION SPOTLIGHT SECTION */}
      <section id="wallets" className="py-24 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3.5 py-1.5 rounded-full border border-sky-500/30">
              STRICT CAPITAL ISOLATION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              The 3-Wallet Security System
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your assets are divided into 3 distinct financial wallets to guarantee security and prevent unintended capital loss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-sky-500/30 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-xl font-mono">
                1
              </div>
              <h3 className="text-xl font-extrabold text-white">Holding Wallet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your primary unencumbered liquidity entry & withdrawal point. Transfer funds instantly into Bot Contracts or Personal Trading.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl font-mono">
                2
              </div>
              <h3 className="text-xl font-extrabold text-white">Bot Trading Wallet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Holds committed principal + unwithdrawable daily yield logs. Locks funds until contract maturity (`now() &gt;= endDate`).
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl font-mono">
                3
              </div>
              <h3 className="text-xl font-extrabold text-white">Personal Options Wallet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated exclusively to high-speed 1m/5m binary options stakes. Instant payouts return directly to your personal balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI BOT TIERS SHOWCASE */}
      <section id="bots" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              ALGORITHMIC BOT TIERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Automated AI Trading Bot Plans
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              All plans include the <strong className="text-emerald-400">$100 Free Trial Credit</strong>. Combine with a minimum $400 top-up from your Holding Wallet to activate!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "1 Month Growth Bot",
                days: 30,
                roi: 15,
                dailyYield: "~0.50% / Day",
                minDep: 500,
                maxDep: 10000,
              },
              {
                name: "3 Month Yield Maximizer",
                days: 90,
                roi: 55,
                dailyYield: "~0.61% / Day",
                minDep: 500,
                maxDep: 25000,
              },
              {
                name: "6 Month Pro Institutional",
                days: 180,
                roi: 130,
                dailyYield: "~0.72% / Day",
                minDep: 1000,
                maxDep: 50000,
              },
              {
                name: "1 Year Elite AI Strategy",
                days: 365,
                roi: 320,
                dailyYield: "~0.88% / Day",
                minDep: 2500,
                maxDep: 100000,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="glass-card glass-card-hover p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      {tier.days} DAYS LOCK
                    </span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      +{tier.roi}% EST. ROI
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white mb-1">{tier.name}</h3>
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                      Daily Profit: {tier.dailyYield}
                    </span>
                  </div>

                  <div className="py-3 border-y border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Daily Profit Rate:</span>
                      <strong className="text-emerald-400">{tier.dailyYield}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Min Deposit:</span>
                      <strong className="text-white">${tier.minDep.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Max Deposit:</span>
                      <strong className="text-white">${tier.maxDep.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Trial Credit:</span>
                      <strong className="text-emerald-400">$100 Included</strong>
                    </div>
                  </div>
                </div>

                <Link
                  href="/bots"
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
                >
                  <span>Claim $100 & Activate</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE PROFIT SIMULATOR */}
      <section id="calculator" className="py-24 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8 relative overflow-hidden">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Interactive Profit Simulator
              </span>
              <h2 className="text-3xl font-extrabold text-white">Calculate Your AI Bot Yields</h2>
              <p className="text-xs text-slate-400">
                Simulate potential returns based on bot contract duration and principal investment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <label className="font-semibold text-slate-300">Investment Amount ($)</label>
                    <span className="font-mono text-sky-400 font-bold">${yieldCalcAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={yieldCalcAmount}
                    onChange={(e) => setYieldCalcAmount(parseInt(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>$500</span>
                    <span>$50,000</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Contract Plan Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { days: 30, label: "1 Month" },
                      { days: 90, label: "3 Month" },
                      { days: 180, label: "6 Month" },
                      { days: 365, label: "1 Year" },
                    ].map((item) => (
                      <button
                        key={item.days}
                        onClick={() => setCalcTierDays(item.days)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                          calcTierDays === item.days
                            ? "bg-sky-500 text-slate-950 shadow-md"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Simulated Net Profit
                  </span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    +${estimatedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Return:</span>
                  <span className="text-white font-bold">${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <Link
                  href="/bots"
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs transition block shadow-lg shadow-sky-500/20"
                >
                  Start Investing Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
