"use client";

import React, { useState, useEffect, useRef } from "react";

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

  // Buffer ref to throttle rapid WebSocket updates to 60fps / 250ms renders
  const latestDepthRef = useRef<{ rawBids: [string, string][]; rawAsks: [string, string][] } | null>(null);

  // Price formatting helper for micro-coins (XRP/DOGE) vs majors (BTC/ETH/SOL)
  const formatPrice = (p: number) => {
    if (p < 10) return p.toFixed(4);
    return p.toFixed(2);
  };

  useEffect(() => {
    const streamSymbol = symbol.toLowerCase();
    let ws: WebSocket | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;
    let renderThrottleTimer: NodeJS.Timeout | null = null;

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

    // Fetch initial depth snapshot
    const fetchBinanceDepth = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          parseAndSetDepth(data.bids, data.asks);
        }
      } catch (e) {
        // Silent fallback
      }
    };

    fetchBinanceDepth();

    // 250ms Throttled Render Loop - prevents React layout thrashing
    renderThrottleTimer = setInterval(() => {
      if (latestDepthRef.current) {
        const { rawBids, rawAsks } = latestDepthRef.current;
        latestDepthRef.current = null;
        parseAndSetDepth(rawBids, rawAsks);
      }
    }, 250);

    // Connect to Binance Depth WebSocket Stream (@depth10 for smooth 1s updates)
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@depth10@1000ms`);

      ws.onopen = () => setIsLiveWs(true);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.bids && data.asks) {
            latestDepthRef.current = { rawBids: data.bids, rawAsks: data.asks };
          }
        } catch (err) {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        setIsLiveWs(false);
        fallbackTimer = setInterval(fetchBinanceDepth, 3000);
      };
    } catch (e) {
      setIsLiveWs(false);
      fallbackTimer = setInterval(fetchBinanceDepth, 3000);
    }

    return () => {
      if (ws) ws.close();
      if (fallbackTimer) clearInterval(fallbackTimer);
      if (renderThrottleTimer) clearInterval(renderThrottleTimer);
    };
  }, [symbol]);

  const maxTotal = Math.max(
    ...asks.map((a) => a.total),
    ...bids.map((b) => b.total),
    1
  );

  return (
    <div className="bg-[#12161f] border border-[#263044] rounded-lg p-3 space-y-3 font-mono text-xs select-none shadow-xl">
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
                className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/15 pointer-events-none rounded-sm transition-all duration-150"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="text-[#f6465d] font-bold z-10">${formatPrice(ask.price)}</span>
              <span className="text-right text-slate-300 z-10">{ask.amount.toFixed(3)}</span>
              <span className="text-right text-[#848e9c] z-10">{ask.total.toFixed(3)}</span>
            </div>
          );
        })}
      </div>

      {/* Mid Market Price Indicator */}
      <div className="py-1.5 my-1 bg-[#181e2a] border-y border-[#263044] text-center font-bold flex items-center justify-between px-2">
        <span className="text-[#0ecb81] text-sm">${formatPrice(livePrice || 0)}</span>
        <span className="text-[10px] text-[#848e9c] font-sans">Binance Matching Engine</span>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="space-y-0.5">
        {bids.map((bid, idx) => {
          const depthPercent = Math.min(100, (bid.total / maxTotal) * 100);
          return (
            <div key={idx} className="relative grid grid-cols-3 py-0.5 items-center text-[11px]">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#0ecb81]/15 pointer-events-none rounded-sm transition-all duration-150"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="text-[#0ecb81] font-bold z-10">${formatPrice(bid.price)}</span>
              <span className="text-right text-slate-300 z-10">{bid.amount.toFixed(3)}</span>
              <span className="text-right text-[#848e9c] z-10">{bid.total.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
