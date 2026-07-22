"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface LiveTradingChartProps {
  symbol: string;
  livePrice: number;
  activeStrikePrice?: number | null;
  activeDirection?: "CALL" | "PUT" | null;
  height?: number;
}

// Deterministic initial points generator to prevent React hydration mismatch
const generateInitialPoints = (basePrice: number) => {
  const points = [];
  const now = Date.now();
  const base = basePrice || 94500;

  for (let i = 40; i >= 0; i--) {
    const t = new Date(now - i * 3000);
    // Deterministic pseudo sine-wave variation to match server & client initial render
    const pseudoDelta = Math.sin(i * 0.4) * 25 + Math.cos(i * 0.2) * 15;
    const price = parseFloat((base + pseudoDelta).toFixed(2));

    points.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      price: price,
      open: parseFloat((price - 3).toFixed(2)),
      high: parseFloat((price + 8).toFixed(2)),
      low: parseFloat((price - 8).toFixed(2)),
      ma20: price,
    });
  }
  return points;
};

export default function LiveTradingChart({
  symbol,
  livePrice,
  activeStrikePrice,
  activeDirection,
  height = 360,
}: LiveTradingChartProps) {
  const [mounted, setMounted] = useState(false);
  const [dataPoints, setDataPoints] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setDataPoints(generateInitialPoints(livePrice || 94520));
  }, []);

  // Fetch real Binance klines from server route
  useEffect(() => {
    if (!mounted) return;
    let isMounted = true;

    const fetchBinanceKlines = async () => {
      try {
        const res = await fetch(`/api/prices?klines=true&symbol=${symbol}`);
        if (res.ok) {
          const data = await res.json();
          if (data.klines && data.klines.length > 0 && isMounted) {
            const formatted = data.klines.map((item: any, idx: number, arr: any[]) => {
              const slice = arr.slice(Math.max(0, idx - 19), idx + 1);
              const sum = slice.reduce((acc, curr) => acc + curr.price, 0);
              const ma = sum / slice.length;
              return { ...item, ma20: parseFloat(ma.toFixed(2)) };
            });
            setDataPoints(formatted);
          }
        }
      } catch (e) {
        console.error("Using fallback chart data", e);
      }
    };

    fetchBinanceKlines();
    return () => {
      isMounted = false;
    };
  }, [symbol, mounted]);

  // Append live ticks continuously
  useEffect(() => {
    if (!mounted || livePrice <= 0) return;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setDataPoints((prev) => {
      if (prev.length === 0) return generateInitialPoints(livePrice);
      const last = prev[prev.length - 1];

      const lastMa = last?.ma20 || livePrice;
      const newMa = parseFloat((lastMa * 0.9 + livePrice * 0.1).toFixed(2));

      const updatedPoint = {
        time: timeStr,
        price: livePrice,
        open: last.price,
        high: Math.max(livePrice, last.high || livePrice),
        low: Math.min(livePrice, last.low || livePrice),
        ma20: newMa,
      };

      return [...prev.slice(-49), updatedPoint];
    });
  }, [livePrice, mounted]);

  const pricesArr = dataPoints.map((d) => d.price).filter(Boolean);
  const minVal = pricesArr.length > 0 ? Math.floor(Math.min(...pricesArr) * 0.9995) : 90000;
  const maxVal = pricesArr.length > 0 ? Math.ceil(Math.max(...pricesArr) * 1.0005) : 100000;

  const isWinning =
    activeStrikePrice &&
    ((activeDirection === "CALL" && livePrice > activeStrikePrice) ||
      (activeDirection === "PUT" && livePrice < activeStrikePrice));

  return (
    <div className="w-full relative">
      {/* Header Overlay */}
      <div className="absolute top-2 left-4 z-10 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-400 font-sans font-bold">{symbol}</span>
          <span className="text-white font-extrabold">${(livePrice || 94520.5).toLocaleString()}</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 border-l border-slate-800 pl-3">
          <span>STREAM: <strong className="text-sky-400">BINANCE TICK STREAM</strong></span>
          <span>
            MA20:{" "}
            <strong className="text-amber-400">
              ${mounted && dataPoints.length > 0 ? dataPoints[dataPoints.length - 1]?.ma20 : livePrice}
            </strong>
          </span>
        </div>
      </div>

      <div style={{ height: `${height}px` }} className="w-full pt-8">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
            Loading Binance Live Chart Stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dataPoints}>
              <defs>
                <linearGradient id="liveAreaGradientBinance" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isWinning ? "#10b981" : activeDirection ? "#f43f5e" : "#0ea5e9"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={isWinning ? "#10b981" : activeDirection ? "#f43f5e" : "#0ea5e9"}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis
                domain={[minVal, maxVal]}
                stroke="#475569"
                fontSize={10}
                orientation="right"
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                tickLine={false}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-panel p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1 shadow-xl">
                        <div className="text-slate-400 text-[10px]">{data.time}</div>
                        <div className="font-bold text-white text-sm">Close Price: ${data.price}</div>
                        {data.open && <div className="text-slate-400">Open: ${data.open}</div>}
                        {data.high && <div className="text-emerald-400">High: ${data.high}</div>}
                        {data.low && <div className="text-rose-400">Low: ${data.low}</div>}
                        {data.ma20 && <div className="text-amber-400">MA20: ${data.ma20}</div>}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Target Strike Line */}
              {activeStrikePrice && (
                <ReferenceLine
                  y={activeStrikePrice}
                  stroke={isWinning ? "#10b981" : "#f43f5e"}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `STRIKE: $${activeStrikePrice}`,
                    fill: isWinning ? "#10b981" : "#f43f5e",
                    fontSize: 11,
                    fontWeight: "bold",
                    position: "top",
                  }}
                />
              )}

              {/* Current Price Line */}
              <ReferenceLine
                y={livePrice}
                stroke="#0ea5e9"
                strokeDasharray="2 2"
                label={{
                  value: `LIVE: $${livePrice}`,
                  fill: "#0ea5e9",
                  fontSize: 10,
                  position: "right",
                }}
              />

              {/* Area Line */}
              <Area
                type="monotone"
                dataKey="price"
                stroke={isWinning ? "#10b981" : activeDirection ? "#f43f5e" : "#0ea5e9"}
                strokeWidth={2.5}
                fill="url(#liveAreaGradientBinance)"
                isAnimationActive={false}
              />

              {/* MA20 Line */}
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
