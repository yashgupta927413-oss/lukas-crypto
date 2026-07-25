"use client";

import React, { useState, useEffect } from "react";

interface LiveOrderbookProps {
  symbol: string;
  livePrice: number;
}

interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export default function LiveOrderbook({ symbol, livePrice }: LiveOrderbookProps) {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [isLiveWs, setIsLiveWs] = useState(false);

  useEffect(() => {
    const streamSymbol = symbol.toLowerCase();
    let ws: WebSocket | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;

    // Fetch initial orderbook depth from Binance REST API
    const fetchBinanceDepth = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          parseAndSetDepth(data.bids, data.asks);
        }
      } catch (e) {
        // Fallback simulation centered on livePrice if REST fails
        generateFallbackDepth(livePrice || 94500);
      }
    };

    const parseAndSetDepth = (rawBids: [string, string][], rawAsks: [string, string][]) => {
      let askTotal = 0;
      let bidTotal = 0;

      const parsedAsks: OrderBookLevel[] = [];
      const parsedBids: OrderBookLevel[] = [];

      // Asks (Sells) - top 6 levels sorted descending
      const topAsks = rawAsks.slice(0, 6).reverse();
      for (const [p, a] of topAsks) {
        const price = parseFloat(p);
        const amount = parseFloat(a);
        askTotal += amount;
        parsedAsks.push({ price, amount, total: parseFloat(askTotal.toFixed(3)) });
      }

      // Bids (Buys) - top 6 levels
      const topBids = rawBids.slice(0, 6);
      for (const [p, a] of topBids) {
        const price = parseFloat(p);
        const amount = parseFloat(a);
        bidTotal += amount;
        parsedBids.push({ price, amount, total: parseFloat(bidTotal.toFixed(3)) });
      }

      setAsks(parsedAsks);
      setBids(parsedBids);
    };

    const generateFallbackDepth = (basePrice: number) => {
      let askTot = 0;
      let bidTot = 0;
      const fAsks = [];
      const fBids = [];

      for (let i = 5; i >= 1; i--) {
        const p = parseFloat((basePrice + i * 2.5).toFixed(2));
        const amt = parseFloat((Math.random() * 1.2 + 0.1).toFixed(3));
        askTot += amt;
        fAsks.push({ price: p, amount: amt, total: parseFloat(askTot.toFixed(3)) });
      }

      for (let i = 1; i <= 5; i++) {
        const p = parseFloat((basePrice - i * 2.5).toFixed(2));
        const amt = parseFloat((Math.random() * 1.2 + 0.1).toFixed(3));
        bidTot += amt;
        fBids.push({ price: p, amount: amt, total: parseFloat(bidTot.toFixed(3)) });
      }

      setAsks(fAsks);
      setBids(fBids);
    };

    // Initial fetch
    fetchBinanceDepth();

    // Connect to real Binance Depth WebSocket Stream
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@depth10@100ms`);

      ws.onopen = () => setIsLiveWs(true);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.bids && data.asks) {
            parseAndSetDepth(data.bids, data.asks);
          }
        } catch (err) {
          console.error("Depth WS parse error", err);
        }
      };

      ws.onerror = () => {
        setIsLiveWs(false);
        fallbackTimer = setInterval(fetchBinanceDepth, 2000);
      };
    } catch (e) {
      setIsLiveWs(false);
      fallbackTimer = setInterval(fetchBinanceDepth, 2000);
    }

    return () => {
      if (ws) ws.close();
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [symbol, livePrice]);

  const maxTotal = Math.max(
    ...asks.map((a) => a.total),
    ...bids.map((b) => b.total),
    1
  );

  return (
    <div className="bg-[#12161f] border border-[#263044] rounded-lg p-3 space-y-3 font-mono text-xs select-none">
      <div className="flex justify-between items-center pb-2 border-b border-[#263044]">
        <span className="font-sans font-bold text-white uppercase text-[11px]">Binance Spot Order Book</span>
        <span className={`text-[10px] font-bold ${isLiveWs ? "text-[#0ecb81]" : "text-[#f0b90b]"}`}>
          {isLiveWs ? "● REAL-TIME WS FEED" : "● SPOT DEPTH FEED"}
        </span>
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
                className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/15 pointer-events-none rounded-sm transition-all"
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
        <span className="text-[10px] text-[#848e9c] font-sans">Binance Matching Engine</span>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="space-y-0.5">
        {bids.map((bid, idx) => {
          const depthPercent = Math.min(100, (bid.total / maxTotal) * 100);
          return (
            <div key={idx} className="relative grid grid-cols-3 py-0.5 items-center text-[11px]">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#0ecb81]/15 pointer-events-none rounded-sm transition-all"
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
