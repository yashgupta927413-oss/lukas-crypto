"use client";

import React from "react";
import TradingViewChart from "./tradingview-chart";
import { ShieldCheck, Timer, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface LiveTradingChartProps {
  symbol: string;
  livePrice: number;
  activeStrikePrice?: number | null;
  activeDirection?: "CALL" | "PUT" | null;
  remainingTimer?: string | null;
  liveStatus?: { label: string; color: string } | null;
  height?: number;
}

export default function LiveTradingChart({
  symbol,
  livePrice,
  activeStrikePrice,
  activeDirection,
  remainingTimer,
  liveStatus,
  height,
}: LiveTradingChartProps) {
  const hasActiveOrder = !!activeStrikePrice && !!activeDirection;
  const strike = Number(activeStrikePrice || 0);
  const isCall = activeDirection === "CALL";

  // Price formatting helper for micro-coins (XRP/DOGE) vs majors (BTC/ETH/SOL/BNB)
  const formatPrice = (val: number) => {
    if (!val || isNaN(val)) return "0.00";
    if (val < 10) {
      return val.toFixed(4);
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formattedLivePrice = formatPrice(livePrice);
  const formattedStrikePrice = formatPrice(strike);

  // Price difference calculations
  const rawDiff = livePrice - strike;
  const absDiff = Math.abs(rawDiff);
  const pctDiff = strike > 0 ? (rawDiff / strike) * 100 : 0;
  const formattedDiff = formatPrice(absDiff);
  const formattedPct = Math.abs(pctDiff).toFixed(3);

  const isInMoney = liveStatus?.label.includes("IN THE") ?? false;

  return (
    <div className="w-full relative bg-[#090d16] rounded-2xl border border-[#1e2638] p-3 shadow-2xl space-y-2 select-none">
      {/* Top Asset & Feed Header Bar */}
      <div className="flex items-center justify-between gap-3 px-1 py-1 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#121722] border border-[#1e2638] px-3 py-1.5 rounded-xl font-mono">
            <span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-ping"></span>
            <span className="text-white font-black">{symbol}</span>
            <span className="text-[#0ecb81] font-bold">${formattedLivePrice}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-[#121722]/60 px-2.5 py-1 rounded-lg border border-[#1e2638] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Feed: <strong className="text-slate-200">Binance Spot Index Feed</strong></span>
          </div>
        </div>

        {hasActiveOrder && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#f0b90b]/10 text-[#f0b90b] border border-[#f0b90b]/30 font-bold flex items-center gap-1.5 shadow">
              <Timer className="w-3.5 h-3.5 animate-spin" />
              <span>EXPIRY: {remainingTimer || "Settling..."}</span>
            </span>
          </div>
        )}
      </div>

      {/* Active Position Institutional Control Bar */}
      {hasActiveOrder && (
        <div className="bg-[#12161f] border border-[#263044] rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs shadow-lg animate-in fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg font-black text-xs flex items-center gap-1.5 shadow ${
                isCall ? "bg-[#0ecb81] text-[#0b0e11]" : "bg-[#f6465d] text-white"
              }`}
            >
              {isCall ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{activeDirection} CONTRACT</span>
            </span>

            <div className="bg-[#181e2a] px-3 py-1 rounded-lg border border-[#263044] text-slate-300">
              <span className="text-[#848e9c] text-[10px] uppercase block font-sans">Strike Rate</span>
              <span className="font-bold text-white">${formattedStrikePrice}</span>
            </div>

            <div className="bg-[#181e2a] px-3 py-1 rounded-lg border border-[#263044] text-slate-300">
              <span className="text-[#848e9c] text-[10px] uppercase block font-sans">Live Spot</span>
              <span className="font-bold text-white">${formattedLivePrice}</span>
            </div>

            <div className="bg-[#181e2a] px-3 py-1 rounded-lg border border-[#263044] text-slate-300">
              <span className="text-[#848e9c] text-[10px] uppercase block font-sans">Price Gap</span>
              <span className={`font-bold ${rawDiff >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                {rawDiff >= 0 ? "+" : "-"}${formattedDiff} ({formattedPct}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-lg border font-black text-xs flex items-center gap-1.5 shadow-md ${
                isInMoney
                  ? "bg-[#0ecb81]/15 text-[#0ecb81] border-[#0ecb81]/40"
                  : "bg-[#f6465d]/15 text-[#f6465d] border-[#f6465d]/40"
              }`}
            >
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              <span>{isInMoney ? "IN THE MONEY ▲ (+75%)" : "OUT OF THE MONEY ▼"}</span>
            </span>
          </div>
        </div>
      )}

      {/* Main TradingView Canvas Area */}
      <div className="relative w-full">
        <TradingViewChart symbol={symbol} height={height} />

        {/* Floating Active Strike Badge Badge Pin Overlay inside chart canvas top-right */}
        {hasActiveOrder && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none font-mono text-xs">
            <div
              className={`px-3 py-1.5 rounded-lg shadow-2xl border backdrop-blur-md flex items-center gap-2 pointer-events-auto ${
                isCall
                  ? "bg-[#0ecb81]/90 text-[#0b0e11] border-emerald-300"
                  : "bg-[#f6465d]/90 text-white border-rose-300"
              }`}
            >
              <Target className="w-4 h-4" />
              <div>
                <span className="text-[10px] block opacity-80 font-sans uppercase font-bold">Entry Strike</span>
                <span className="font-black text-sm">${formattedStrikePrice}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
