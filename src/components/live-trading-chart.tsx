"use client";

import React, { useState, useEffect } from "react";
import TradingViewChart from "./tradingview-chart";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { CandlestickChart, TrendingUp, BarChart2, ShieldCheck, Activity } from "lucide-react";

interface LiveTradingChartProps {
  symbol: string;
  livePrice: number;
  activeStrikePrice?: number | null;
  activeDirection?: "CALL" | "PUT" | null;
  height?: number;
}

// Custom SVG shape for Japanese Candlesticks (Fallback View)
const CandlestickShape = (props: any) => {
  const { x, width, y, height, payload, yAxis } = props;
  if (!payload || payload.open === undefined || payload.high === undefined || payload.low === undefined) {
    return null;
  }

  const { open, high, low, price } = payload;
  const close = price;
  const isGreen = close >= open;
  const color = isGreen ? "#10b981" : "#ef4444";

  const getPixelY = (val: number) => {
    if (yAxis && typeof yAxis.scale === "function") {
      const scaled = yAxis.scale(val);
      if (typeof scaled === "number" && !isNaN(scaled)) return scaled;
    }
    const dMin = yAxis?.domain?.[0] || 0;
    const dMax = yAxis?.domain?.[1] || 1;
    const range = dMax - dMin || 1;
    return y + height - ((val - dMin) / range) * height;
  };

  const yHigh = getPixelY(high);
  const yLow = getPixelY(low);
  const yOpen = getPixelY(open);
  const yClose = getPixelY(close);

  const candleWidth = Math.max(3, width * 0.65);
  const candleX = x + (width - candleWidth) / 2;
  const wickX = x + width / 2;

  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(2, Math.abs(yOpen - yClose));

  return (
    <g className="candlestick-item">
      <line x1={wickX} y1={yHigh} x2={wickX} y2={yLow} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <rect x={candleX} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} stroke={color} strokeWidth={1} rx={1} />
    </g>
  );
};

// Deterministic initial points generator for fallback mode
const generateInitialPoints = (basePrice: number) => {
  const points = [];
  const now = Date.now();
  const base = basePrice || 94500;

  for (let i = 40; i >= 0; i--) {
    const t = new Date(now - i * 3000);
    const pseudoDelta = Math.sin(i * 0.4) * 25 + Math.cos(i * 0.2) * 15;
    const price = parseFloat((base + pseudoDelta).toFixed(2));
    const open = parseFloat((price - (Math.sin(i) * 12)).toFixed(2));
    const high = parseFloat((Math.max(price, open) + Math.abs(Math.cos(i) * 15)).toFixed(2));
    const low = parseFloat((Math.min(price, open) - Math.abs(Math.sin(i) * 15)).toFixed(2));

    points.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      price: price,
      open: open,
      high: high,
      low: low,
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
  height = 460,
}: LiveTradingChartProps) {
  const [mounted, setMounted] = useState(false);
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [viewSource, setViewSource] = useState<"BINANCE_TRADINGVIEW" | "FAST_CANVAS">("BINANCE_TRADINGVIEW");

  useEffect(() => {
    setMounted(true);
    setDataPoints(generateInitialPoints(livePrice || 94520));
  }, []);

  useEffect(() => {
    if (!mounted || viewSource !== "FAST_CANVAS") return;
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
  }, [symbol, mounted, viewSource]);

  const pricesArr = dataPoints.flatMap((d) => [d.low, d.high, d.price, d.open]).filter((v) => typeof v === "number" && !isNaN(v));
  const minVal = pricesArr.length > 0 ? Math.floor(Math.min(...pricesArr) * 0.9992) : 90000;
  const maxVal = pricesArr.length > 0 ? Math.ceil(Math.max(...pricesArr) * 1.0008) : 100000;

  const isWinning =
    activeStrikePrice &&
    ((activeDirection === "CALL" && livePrice > activeStrikePrice) ||
      (activeDirection === "PUT" && livePrice < activeStrikePrice));

  return (
    <div className="w-full relative bg-[#090d16] rounded-2xl border border-slate-800 p-3 shadow-2xl space-y-2">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-white font-black">{symbol}</span>
            <span className="text-emerald-400 font-bold">${(livePrice || 94520.5).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-slate-800/60 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Feed: <strong className="text-slate-200">Binance Spot WebSocket</strong></span>
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewSource("BINANCE_TRADINGVIEW")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewSource === "BINANCE_TRADINGVIEW"
                ? "bg-sky-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Binance TradingView</span>
          </button>
          <button
            onClick={() => setViewSource("FAST_CANVAS")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewSource === "FAST_CANVAS"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CandlestickChart className="w-3.5 h-3.5" />
            <span>Strike Overlay View</span>
          </button>
        </div>
      </div>

      {/* Active Position Banner (If Options trade active) */}
      {activeStrikePrice && (
        <div className={`p-2.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
          isWinning
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">ACTIVE {activeDirection} POSITION @ STRIKE ${activeStrikePrice.toLocaleString()}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 font-bold border border-slate-800">
              {isWinning ? "IN THE MONEY ▲ (+75% PAYOUT)" : "OUT OF THE MONEY ▼"}
            </span>
          </div>
          <div>LIVE: ${livePrice.toLocaleString()}</div>
        </div>
      )}

      {/* Main Chart Rendering */}
      {viewSource === "BINANCE_TRADINGVIEW" ? (
        <TradingViewChart symbol={symbol} height={height} />
      ) : (
        <div style={{ height: `${height}px` }} className="w-full relative bg-slate-950 rounded-xl border border-slate-800 p-2">
          {!mounted ? (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
              Loading Chart Stream...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="liveAreaGradientBinance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isWinning ? "#10b981" : "#0ea5e9"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isWinning ? "#10b981" : "#0ea5e9"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis domain={[minVal, maxVal]} stroke="#475569" fontSize={10} orientation="right" tickFormatter={(v) => `$${v.toLocaleString()}`} tickLine={false} />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="glass-panel p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1 shadow-xl bg-slate-950/95">
                          <div className="text-slate-400 text-[10px]">{data.time}</div>
                          <div className="font-bold text-white">Price: ${data.price}</div>
                          {data.open && <div className="text-slate-400">Open: ${data.open}</div>}
                          {data.high && <div className="text-emerald-400">High: ${data.high}</div>}
                          {data.low && <div className="text-rose-400">Low: ${data.low}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Bar dataKey="open" shape={<CandlestickShape />} isAnimationActive={false} />

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

                <ReferenceLine
                  y={livePrice}
                  stroke="#0ea5e9"
                  strokeDasharray="2 2"
                  label={{ value: `LIVE: $${livePrice}`, fill: "#0ea5e9", fontSize: 10, position: "right" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}


