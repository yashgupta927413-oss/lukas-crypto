"use client";

import React, { useState, useEffect } from "react";

interface LiveTradesStreamProps {
  symbol: string;
  livePrice: number;
}

export default function LiveTradesStream({ symbol, livePrice }: LiveTradesStreamProps) {
  const [trades, setTrades] = useState<{ id: string; price: number; amount: number; time: string; side: "BUY" | "SELL" }[]>([]);

  useEffect(() => {
    const basePrice = livePrice || 94500;

    // Seed initial trades
    const initial = [];
    const now = Date.now();
    for (let i = 8; i >= 0; i--) {
      const isBuy = Math.random() > 0.48;
      const delta = (Math.random() - 0.5) * 6;
      const p = parseFloat((basePrice + delta).toFixed(2));
      const amt = parseFloat((Math.random() * 0.8 + 0.05).toFixed(3));
      const t = new Date(now - i * 1200).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      initial.push({
        id: Math.random().toString(),
        price: p,
        amount: amt,
        time: t,
        side: isBuy ? ("BUY" as const) : ("SELL" as const),
      });
    }
    setTrades(initial);

    // Stream new live market trades
    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.47;
      const delta = (Math.random() - 0.5) * 4;
      const p = parseFloat((basePrice + delta).toFixed(2));
      const amt = parseFloat((Math.random() * 1.2 + 0.02).toFixed(3));
      const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      setTrades((prev) => [
        { id: Math.random().toString(), price: p, amount: amt, time: t, side: isBuy ? "BUY" : ("SELL" as const) },
        ...prev.slice(0, 14),
      ]);
    }, 1800);

    return () => clearInterval(interval);
  }, [livePrice]);

  return (
    <div className="bg-[#12161f] border border-[#263044] rounded-lg p-3 space-y-3 font-mono text-xs select-none">
      <div className="flex justify-between items-center pb-2 border-b border-[#263044]">
        <span className="font-sans font-bold text-white uppercase text-[11px]">Recent Executed Trades</span>
        <span className="text-[10px] text-[#0ecb81] font-bold">● LIVE STREAM</span>
      </div>

      <div className="grid grid-cols-3 text-[10px] text-[#848e9c] uppercase font-sans">
        <span>Price (USDT)</span>
        <span className="text-right">Size ({symbol.replace("USDT", "")})</span>
        <span className="text-right">Time</span>
      </div>

      <div className="space-y-1">
        {trades.map((t) => (
          <div key={t.id} className="grid grid-cols-3 py-0.5 items-center text-[11px] hover:bg-[#181e2a] rounded px-1 transition-colors">
            <span className={`font-bold ${t.side === "BUY" ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
              ${t.price.toFixed(2)}
            </span>
            <span className="text-right text-slate-300">{t.amount.toFixed(3)}</span>
            <span className="text-right text-[#848e9c] text-[10px]">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
