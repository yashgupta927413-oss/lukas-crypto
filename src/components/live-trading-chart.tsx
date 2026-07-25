"use client";

import React from "react";
import TradingViewChart from "./tradingview-chart";
import { ShieldCheck, Timer, TrendingUp, TrendingDown } from "lucide-react";

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

  // Helper to format currency price depending on coin scale
  const formatPrice = (val: number) => {
    if (!val || isNaN(val)) return "0.00";
    if (val < 10) {
      return val.toFixed(4);
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Dynamic percentage offset calculation for any asset scale
  // pctDiff measures percentage deviation from entry strike
  let offsetPct = 50;
  if (hasActiveOrder && strike > 0 && livePrice > 0) {
    const pctDiff = ((livePrice - strike) / strike) * 100;
    // Map -0.5% .. +0.5% deviation to 20% .. 80% container height
    offsetPct = Math.max(18, Math.min(82, 50 - pctDiff * 60));
  }

  const formattedLivePrice = formatPrice(livePrice);
  const formattedStrikePrice = formatPrice(strike);

  return (
    <div className="w-full relative bg-[#090d16] rounded-2xl border border-[#1e2638] p-3 shadow-2xl space-y-2 select-none">
      {/* Top Header Bar */}
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

        {/* Live Active Trade Badge Overlay Header */}
        {hasActiveOrder && (
          <div className="flex items-center gap-2 font-mono">
            <span
              className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 shadow-lg ${
                isCall
                  ? "bg-[#0ecb81]/15 text-[#0ecb81] border-[#0ecb81]/40"
                  : "bg-[#f6465d]/15 text-[#f6465d] border-[#f6465d]/40"
              }`}
            >
              {isCall ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {activeDirection} ENTRY @ ${formattedStrikePrice}
              </span>
            </span>

            {remainingTimer && (
              <span className="px-2.5 py-1 rounded-lg bg-[#f0b90b]/10 text-[#f0b90b] border border-[#f0b90b]/30 font-bold text-xs flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span>{remainingTimer}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Relative Canvas Container */}
      <div className="relative w-full">
        {/* Main Official Binance TradingView Chart Embed */}
        <TradingViewChart symbol={symbol} height={height} />

        {/* Chart Order Strike Line & Badge Marker Overlay */}
        {hasActiveOrder && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none transition-all duration-300 flex items-center"
            style={{ top: `${offsetPct}%` }}
          >
            {/* Left Order Side Tag */}
            <div
              className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded-r shadow-lg ${
                isCall ? "bg-[#0ecb81] text-[#0b0e11]" : "bg-[#f6465d] text-white"
              }`}
            >
              {activeDirection}
            </div>

            {/* Center Glowing Dashed Strike Line */}
            <div
              className={`w-full border-b-2 border-dashed ${
                isCall
                  ? "border-[#0ecb81] drop-shadow-[0_0_8px_rgba(14,203,129,0.8)]"
                  : "border-[#f6465d] drop-shadow-[0_0_8px_rgba(246,70,93,0.8)]"
              }`}
            />

            {/* Floating Right Order Pin Badge */}
            <div
              className={`absolute right-3 px-3 py-1.5 rounded-lg shadow-2xl font-mono text-xs font-black flex items-center gap-2 border pointer-events-auto ${
                isCall
                  ? "bg-[#0ecb81] text-[#0b0e11] border-emerald-300"
                  : "bg-[#f6465d] text-white border-rose-300"
              }`}
            >
              <span>STRIKE RATE: ${formattedStrikePrice}</span>
              {liveStatus && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    liveStatus.label.includes("IN THE")
                      ? "bg-[#0b0e11] text-[#0ecb81] border border-[#0ecb81]/40"
                      : "bg-[#0b0e11] text-[#f6465d] border border-[#f6465d]/40"
                  }`}
                >
                  {liveStatus.label.includes("IN THE") ? "▲ IN MONEY" : "▼ OUT MONEY"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
