"use client";

import React, { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
  interval?: string;
}

function TradingViewChart({
  symbol = "BTCUSDT",
  height = 520,
  interval = "1",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize symbol: e.g. "BTCUSDT" -> "BINANCE:BTCUSDT"
  const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const tvSymbol = cleanSymbol.includes(":") ? cleanSymbol : `BINANCE:${cleanSymbol}`;

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1", // 1 = Japanese Candlesticks
      locale: "en",
      enable_publishing: false,
      backgroundColor: "#090d16",
      gridColor: "rgba(30, 41, 59, 0.4)",
      hide_side_toolbar: false,
      allow_symbol_change: true,
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, [tvSymbol, interval]);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-[#1e2638] bg-[#090d16] shadow-2xl relative"
      style={{ height: `${height}px` }}
    >
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full h-full"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default memo(TradingViewChart);
