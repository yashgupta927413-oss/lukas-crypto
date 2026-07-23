"use client";

import React, { useState, useEffect } from "react";

interface LiveOrderbookProps {
  symbol: string;
  livePrice: number;
}

export default function LiveOrderbook({ symbol, livePrice }: LiveOrderbookProps) {
  const [bids, setBids] = useState<{ price: number; amount: number; total: number }[]>([]);
  const [asks, setAsks] = useState<{ price: number; amount: number; total: number }[]>([]);

  useEffect(() => {
    const basePrice = livePrice || 94500;
    const generateOrderbook = () => {
      const askList = [];
      const bidList = [];
      let askTotal = 0;
      let bidTotal = 0;

      // Generate 6 Ask levels (higher than price)
      for (let i = 5; i >= 1; i--) {
        const p = parseFloat((basePrice + i * 4.5).toFixed(2));
        const amt = parseFloat((Math.random() * 1.5 + 0.1).toFixed(3));
        askTotal += amt;
        askList.push({ price: p, amount: amt, total: parseFloat(askTotal.toFixed(3)) });
      }

      // Generate 6 Bid levels (lower than price)
      for (let i = 1; i <= 5; i++) {
        const p = parseFloat((basePrice - i * 4.5).toFixed(2));
        const amt = parseFloat((Math.random() * 1.5 + 0.1).toFixed(3));
        bidTotal += amt;
        bidList.push({ price: p, amount: amt, total: parseFloat(bidTotal.toFixed(3)) });
      }

      setAsks(askList);
      setBids(bidList);
    };

    generateOrderbook();
    const interval = setInterval(generateOrderbook, 2500);
    return () => clearInterval(interval);
  }, [livePrice]);

  const maxTotal = Math.max(
    ...asks.map((a) => a.total),
    ...bids.map((b) => b.total),
    1
  );

  return (
    <div className="bg-[#12161f] border border-[#263044] rounded-lg p-3 space-y-3 font-mono text-xs select-none">
      <div className="flex justify-between items-center pb-2 border-b border-[#263044]">
        <span className="font-sans font-bold text-white uppercase text-[11px]">Order Book</span>
        <span className="text-[10px] text-[#848e9c]">Real-Time Depth</span>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-3 text-[10px] text-[#848e9c] uppercase font-sans">
        <span>Price (USDT)</span>
        <span className="text-right">Size ({symbol.replace("USDT", "")})</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sell Orders - Red) */}
      <div className="space-y-0.5">
        {asks.map((ask, idx) => {
          const depthPercent = Math.min(100, (ask.total / maxTotal) * 100);
          return (
            <div key={idx} className="relative grid grid-cols-3 py-0.5 items-center text-[11px]">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/10 pointer-events-none rounded-sm transition-all"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="text-[#f6465d] font-bold z-10">${ask.price.toFixed(2)}</span>
              <span className="text-right text-slate-300 z-10">{ask.amount.toFixed(3)}</span>
              <span className="text-right text-[#848e9c] z-10">{ask.total.toFixed(3)}</span>
            </div>
          );
        })}
      </div>

      {/* Mid Market Price Indicator */}
      <div className="py-1.5 my-1 bg-[#181e2a] border-y border-[#263044] text-center font-bold flex items-center justify-between px-2">
        <span className="text-[#0ecb81] text-sm">${(livePrice || 0).toFixed(2)}</span>
        <span className="text-[10px] text-[#848e9c] font-sans">Binance Spot Index</span>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="space-y-0.5">
        {bids.map((bid, idx) => {
          const depthPercent = Math.min(100, (bid.total / maxTotal) * 100);
          return (
            <div key={idx} className="relative grid grid-cols-3 py-0.5 items-center text-[11px]">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#0ecb81]/10 pointer-events-none rounded-sm transition-all"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="text-[#0ecb81] font-bold z-10">${bid.price.toFixed(2)}</span>
              <span className="text-right text-slate-300 z-10">{bid.amount.toFixed(3)}</span>
              <span className="text-right text-[#848e9c] z-10">{bid.total.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
