"use client";

import React, { useState, useEffect } from "react";
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
import { CandlestickChart, TrendingUp, BarChart2, Eye } from "lucide-react";

interface LiveTradingChartProps {
  symbol: string;
  livePrice: number;
  activeStrikePrice?: number | null;
  activeDirection?: "CALL" | "PUT" | null;
  height?: number;
}

// Custom SVG shape to render real Japanese Candlesticks (Green/Red)
const CandlestickShape = (props: any) => {
  const { x, width, y, height, payload, yAxis } = props;
  if (!payload || payload.open === undefined || payload.high === undefined || payload.low === undefined) {
    return null;
  }

  const { open, high, low, price } = payload;
  const close = price;
  const isGreen = close >= open;
  const color = isGreen ? "#10b981" : "#ef4444";

  // Calculate pixel Y coordinates safely
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
      {/* Wick / Shadow Line */}
      <line
        x1={wickX}
        y1={yHigh}
        x2={wickX}
        y2={yLow}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Candle Body Rectangle */}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={1}
        rx={1}
      />
    </g>
  );
};

// Custom SVG shape for Volume bars with matching direction colors
const VolumeBarShape = (props: any) => {
  const { x, width, y, height, payload } = props;
  if (!payload) return null;
  const isGreen = (payload.price || 0) >= (payload.open || 0);
  const color = isGreen ? "rgba(16, 185, 129, 0.35)" : "rgba(239, 68, 68, 0.35)";
  const barWidth = Math.max(2, width * 0.65);
  const barX = x + (width - barWidth) / 2;

  return (
    <rect
      x={barX}
      y={y}
      width={barWidth}
      height={height}
      fill={color}
      rx={1}
    />
  );
};

// Deterministic initial points generator to prevent React hydration mismatch
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
    const volume = Math.floor(Math.abs(Math.sin(i * 0.7) * 80 + 20));

    points.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      price: price, // close
      open: open,
      high: high,
      low: low,
      volume: volume,
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
  height = 380,
}: LiveTradingChartProps) {
  const [mounted, setMounted] = useState(false);
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [chartType, setChartType] = useState<"CANDLESTICK" | "AREA">("CANDLESTICK");
  const [showVolume, setShowVolume] = useState(true);
  const [showMA20, setShowMA20] = useState(true);
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h">("1m");

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
  }, [symbol, mounted, timeframe]);

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
      const openPrice = last.price || livePrice;
      const highPrice = Math.max(livePrice, openPrice, last.high || livePrice);
      const lowPrice = Math.min(livePrice, openPrice, last.low || livePrice);

      const updatedPoint = {
        time: timeStr,
        price: livePrice, // close
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        volume: Math.floor(Math.random() * 40 + 15),
        ma20: newMa,
      };

      return [...prev.slice(-49), updatedPoint];
    });
  }, [livePrice, mounted]);

  const pricesArr = dataPoints.flatMap((d) => [d.low, d.high, d.price, d.open]).filter((v) => typeof v === "number" && !isNaN(v));
  const minVal = pricesArr.length > 0 ? Math.floor(Math.min(...pricesArr) * 0.9992) : 90000;
  const maxVal = pricesArr.length > 0 ? Math.ceil(Math.max(...pricesArr) * 1.0008) : 100000;

  const maxVolume = Math.max(...dataPoints.map((d) => d.volume || 0), 100);

  const isWinning =
    activeStrikePrice &&
    ((activeDirection === "CALL" && livePrice > activeStrikePrice) ||
      (activeDirection === "PUT" && livePrice < activeStrikePrice));

  const latestCandle = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : null;
  const priceChange = latestCandle && latestCandle.open ? latestCandle.price - latestCandle.open : 0;
  const priceChangePct = latestCandle && latestCandle.open ? (priceChange / latestCandle.open) * 100 : 0;

  return (
    <div className="w-full relative bg-slate-950/90 rounded-3xl border border-slate-800/90 p-4 shadow-2xl backdrop-blur-xl">
      {/* Header Overlay & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-2">
        {/* Left: Ticker & Live Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-white font-extrabold text-sm tracking-wide">{symbol}</span>
            <span className="text-sky-400 font-mono font-bold text-sm">
              ${(livePrice || 94520.5).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${priceChange >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
            {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePct >= 0 ? "+" : ""}{priceChangePct.toFixed(2)}%)
          </div>

          {latestCandle && (
            <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400 border-l border-slate-800/80 pl-3">
              <span>O: <strong className="text-slate-200">${latestCandle.open?.toFixed(2)}</strong></span>
              <span>H: <strong className="text-emerald-400">${latestCandle.high?.toFixed(2)}</strong></span>
              <span>L: <strong className="text-rose-400">${latestCandle.low?.toFixed(2)}</strong></span>
              <span>C: <strong className="text-sky-400">${latestCandle.price?.toFixed(2)}</strong></span>
            </div>
          )}
        </div>

        {/* Right: Chart Controls (Candlestick vs Area, Timeframe, Indicators) */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            {(["1m", "5m", "15m", "1h"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                  timeframe === tf
                    ? "bg-sky-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => setChartType("CANDLESTICK")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartType === "CANDLESTICK"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Japanese Candlestick Chart"
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => setChartType("AREA")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                chartType === "AREA"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Smooth Line & Area Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Area</span>
            </button>
          </div>

          {/* Indicator Toggles */}
          <button
            onClick={() => setShowMA20(!showMA20)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all ${
              showMA20
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            MA20
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all flex items-center gap-1 ${
              showVolume
                ? "bg-purple-500/10 border-purple-500/40 text-purple-400"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            VOL
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ height: `${height}px` }} className="w-full relative">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
            Connecting to Binance Live Candlestick Feed...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="liveAreaGradientBinance" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isWinning ? "#10b981" : activeDirection ? "#f43f5e" : "#0ea5e9"}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={isWinning ? "#10b981" : activeDirection ? "#f43f5e" : "#0ea5e9"}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
              
              {/* Primary Y-Axis for Price */}
              <YAxis
                yAxisId="priceAxis"
                domain={[minVal, maxVal]}
                stroke="#475569"
                fontSize={10}
                orientation="right"
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                tickLine={false}
              />

              {/* Secondary Y-Axis for Volume */}
              {showVolume && (
                <YAxis
                  yAxisId="volumeAxis"
                  domain={[0, maxVolume * 3.5]}
                  orientation="left"
                  hide={true}
                />
              )}

              {/* Hover Tooltip */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isUp = (data.price || 0) >= (data.open || 0);
                    return (
                      <div className="glass-panel p-3 rounded-2xl border border-slate-800 text-xs font-mono space-y-1.5 shadow-2xl bg-slate-950/95 backdrop-blur-md">
                        <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 flex justify-between gap-4">
                          <span>TIME: {data.time}</span>
                          <span className={isUp ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {isUp ? "BULLISH ▲" : "BEARISH ▼"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>Open: <strong className="text-slate-200">${data.open?.toFixed(2)}</strong></div>
                          <div>Close: <strong className="text-sky-400">${data.price?.toFixed(2)}</strong></div>
                          <div>High: <strong className="text-emerald-400">${data.high?.toFixed(2)}</strong></div>
                          <div>Low: <strong className="text-rose-400">${data.low?.toFixed(2)}</strong></div>
                        </div>
                        {data.ma20 && <div className="text-amber-400 pt-1 border-t border-slate-800/80">MA20: ${data.ma20?.toFixed(2)}</div>}
                        {data.volume && <div className="text-purple-400">Vol: {data.volume}</div>}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Volume Bars */}
              {showVolume && (
                <Bar
                  yAxisId="volumeAxis"
                  dataKey="volume"
                  shape={<VolumeBarShape />}
                  isAnimationActive={false}
                />
              )}

              {/* Candlestick Bars */}
              {chartType === "CANDLESTICK" && (
                <Bar
                  yAxisId="priceAxis"
                  dataKey="open"
                  shape={<CandlestickShape />}
                  isAnimationActive={false}
                />
              )}

              {/* Area Line View */}
              {chartType === "AREA" && (
                <Area
                  yAxisId="priceAxis"
                  type="monotone"
                  dataKey="price"
                  stroke={isWinning ? "#10b981" : activeDirection ? "#f43f5e" : "#0ea5e9"}
                  strokeWidth={2.5}
                  fill="url(#liveAreaGradientBinance)"
                  isAnimationActive={false}
                />
              )}

              {/* MA20 Indicator Line */}
              {showMA20 && (
                <Line
                  yAxisId="priceAxis"
                  type="monotone"
                  dataKey="ma20"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Target Strike Price Reference Line */}
              {activeStrikePrice && (
                <ReferenceLine
                  yAxisId="priceAxis"
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

              {/* Current Live Price Line */}
              <ReferenceLine
                yAxisId="priceAxis"
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
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

