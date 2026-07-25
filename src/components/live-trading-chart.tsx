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

  // Calculate position overlay percentage on chart container (between 25% and 75%)
  const priceDiff = livePrice - strike;
  const offsetPct = Math.max(25, Math.min(75, 50 - (priceDiff / (livePrice * 0.005)) * 25));

  return (
    <div className="w-full relative bg-[#090d16] rounded-2xl border border-[#1e2638] p-3 shadow-2xl space-y-2 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 px-1 py-1 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#121722] border border-[#1e2638] px-3 py-1.5 rounded-xl font-mono">
            <span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-ping"></span>
            <span className="text-white font-black">{symbol}</span>
            <span className="text-[#0ecb81] font-bold">
              ${(livePrice || 94520.5).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-[#121722]/60 px-2.5 py-1 rounded-lg border border-[#1e2638] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Feed: <strong className="text-slate-200">Binance Spot Real-Time Feed</strong></span>
          </div>
        </div>

        {/* Live Active Trade Badge Overlay Header */}
        {hasActiveOrder && (
          <div className="flex items-center gap-2 font-mono">
            <span className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 shadow-lg ${
              isCall ? "bg-[#0ecb81]/15 text-[#0ecb81] border-[#0ecb81]/40" : "bg-[#f6465d]/15 text-[#f6465d] border-[#f6465d]/40"
            }`}>
              {isCall ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{activeDirection} @ ${strike.toFixed(2)}</span>
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

        {/* Chart Order Strike Line & Badge Marker */}
        {hasActiveOrder && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none transition-all duration-300 flex items-center"
            style={{ top: `${offsetPct}%` }}
          >
            {/* Horizontal Dashed Line */}
            <div className={`w-full border-b-2 border-dashed ${
              isCall ? "border-[#0ecb81]" : "border-[#f6465d]"
            }`} />

            {/* Floating Order Marker Pin on Right */}
            <div className={`absolute right-4 px-3 py-1 rounded-lg shadow-xl font-mono text-xs font-black flex items-center gap-1.5 border pointer-events-auto ${
              isCall
                ? "bg-[#0ecb81] text-[#0b0e11] border-emerald-400"
                : "bg-[#f6465d] text-white border-rose-400"
            }`}>
              <span>STRIKE: ${strike.toFixed(2)}</span>
              {liveStatus && (
                <span className="text-[10px] bg-[#0b0e11] text-white px-1.5 py-0.5 rounded">
                  {liveStatus.label.includes("IN THE") ? "▲ WINNING" : "▼ OUT"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
