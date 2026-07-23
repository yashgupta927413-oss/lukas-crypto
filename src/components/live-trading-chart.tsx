"use client";

import React from "react";
import TradingViewChart from "./tradingview-chart";
import { ShieldCheck } from "lucide-react";

interface LiveTradingChartProps {
  symbol: string;
  livePrice: number;
  activeStrikePrice?: number | null;
  activeDirection?: "CALL" | "PUT" | null;
  height?: number;
}

export default function LiveTradingChart({
  symbol,
  livePrice,
  height = 520,
}: LiveTradingChartProps) {
  return (
    <div className="w-full relative bg-[#090d16] rounded-2xl border border-[#1e2638] p-3 shadow-2xl space-y-2">
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
      </div>

      {/* Main Official Binance TradingView Chart Embed */}
      <TradingViewChart symbol={symbol} height={height} />
    </div>
  );
}



