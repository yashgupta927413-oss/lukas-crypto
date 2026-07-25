"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/navbar";
import LiveTradingChart from "@/components/live-trading-chart";
import LiveOrderbook from "@/components/live-orderbook";
import LiveTradesStream from "@/components/live-trades-stream";
import Footer from "@/components/footer";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Timer,
  Layers,
  BarChart2,
} from "lucide-react";
import WalletTransferModal from "@/components/wallet-transfer-modal";

export default function OptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSDT");
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [livePrice, setLivePrice] = useState<number>(94520.5);
  const [price24hChange, setPrice24hChange] = useState<number>(3.42);

  const [personalBalance, setPersonalBalance] = useState<number>(0);
  const [holdingBalance, setHoldingBalance] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>("100");
  const [winPayoutRate, setWinPayoutRate] = useState<number>(75);

  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"POSITIONS" | "HISTORY" | "ORDERBOOK">("POSITIONS");
  const [rightDrawerTab, setRightDrawerTab] = useState<"ORDERBOOK" | "TRADES">("ORDERBOOK");

  const assets = [
    { symbol: "BTCUSDT", name: "Bitcoin", pair: "BTC/USDT" },
    { symbol: "ETHUSDT", name: "Ethereum", pair: "ETH/USDT" },
    { symbol: "SOLUSDT", name: "Solana", pair: "SOL/USDT" },
    { symbol: "XRPUSDT", name: "Ripple", pair: "XRP/USDT" },
    { symbol: "DOGEUSDT", name: "Dogecoin", pair: "DOGE/USDT" },
    { symbol: "BNBUSDT", name: "Binance Coin", pair: "BNB/USDT" },
  ];

  const timeframes = ["1m", "5m", "15m"];

  // Live timer tick for trade countdowns
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live WebSocket Connection to Binance
  useEffect(() => {
    const streamSymbol = selectedAsset.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@trade`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.p) {
        const price = parseFloat(message.p);
        setLivePrice(price);
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedAsset]);

  // Fetch Trades & Personal Balance
  const fetchTradesAndWallet = async () => {
    if (!session) return;
    try {
      const [tradeRes, walletRes, botRes, priceRes] = await Promise.all([
        fetch("/api/options"),
        fetch("/api/user/wallet"),
        fetch("/api/bots"),
        fetch("/api/prices"),
      ]);

      if (tradeRes.ok) {
        const data = await tradeRes.json();
        setTrades(data.trades || []);
      }

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setPersonalBalance(Number(walletData.personalTradingBalance || 0));
        setHoldingBalance(Number(walletData.holdingBalance || 0));
      }

      if (botRes.ok) {
        const botData = await botRes.json();
        if (botData.globalConfig?.binaryOptionWinRate) {
          setWinPayoutRate(Number(botData.globalConfig.binaryOptionWinRate));
        }
      }

      if (priceRes.ok) {
        const pData = await priceRes.json();
        if (pData[selectedAsset]?.change24h) {
          setPrice24hChange(pData[selectedAsset].change24h);
        }
        const extracted: Record<string, number> = {};
        for (const k in pData) {
          if (pData[k]?.price) extracted[k] = pData[k].price;
        }
        setAllMarketPrices(extracted);
      }
    } catch (e) {
      console.error("Options page fetch error", e);
    }
  };

  const [allMarketPrices, setAllMarketPrices] = useState<Record<string, number>>({});
  const isSettlingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchTradesAndWallet();
    const interval = setInterval(fetchTradesAndWallet, 2000);
    return () => clearInterval(interval);
  }, [session, selectedAsset]);

  // Auto trigger settlement when expired trades exist
  useEffect(() => {
    const expiredPending = trades.find(
      (t) => t.status === "PENDING" && new Date(t.expiresAt).getTime() <= nowTime
    );

    if (expiredPending && !isSettlingRef.current.has(expiredPending.id)) {
      isSettlingRef.current.add(expiredPending.id);

      fetch("/api/options", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId: expiredPending.id }),
      })
        .then(() => fetchTradesAndWallet())
        .finally(() => {
          setTimeout(() => {
            isSettlingRef.current.delete(expiredPending.id);
          }, 3000);
        });
    }
  }, [nowTime, trades]);

  const handleExecuteTrade = async (direction: "CALL" | "PUT") => {
    if (!session) {
      router.push("/login?callbackUrl=/options");
      return;
    }

    const stake = parseFloat(stakeAmount);
    if (isNaN(stake) || stake <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    if (stake > personalBalance) {
      setError(`Insufficient balance in Options Trading Wallet.`);
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedAsset,
          direction,
          stakeAmount: stake,
          expiryTimeframe: timeframe,
          strikePrice: livePrice,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`${direction} order opened @ $${data.strikePrice}`);
        fetchTradesAndWallet();
      } else {
        setError(data.error || "Order execution failed");
      }
    } catch (e: any) {
      setError(e.message || "Execution error");
    } finally {
      setLoading(false);
    }
  };

  const setStakePercentage = (percent: number) => {
    if (personalBalance <= 0) return;
    const calc = (personalBalance * (percent / 100)).toFixed(2);
    setStakeAmount(calc);
  };

  const calculatedPayout = (parseFloat(stakeAmount) || 0) * (1 + winPayoutRate / 100);

  // Helper to calculate remaining time
  const getRemainingSec = (expiresAt: string | Date) => {
    const diffMs = new Date(expiresAt).getTime() - nowTime;
    return Math.max(0, Math.floor(diffMs / 1000));
  };

  const formatTimer = (expiresAt: string | Date) => {
    const totalSec = getRemainingSec(expiresAt);
    if (totalSec <= 0) return "Settling...";
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Helper to determine live PnL status using trade's symbol price
  const getTradeLiveStatus = (trade: any) => {
    const strike = Number(trade.strikePrice);
    const currentPrice = trade.symbol === selectedAsset ? livePrice : (allMarketPrices[trade.symbol] || strike);

    if (currentPrice === strike) return { label: "STRIKE MATCH", color: "text-sky-600 bg-sky-50 border-sky-200" };
    if (trade.direction === "CALL") {
      return currentPrice > strike
        ? { label: "IN THE MONEY ▲", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
        : { label: "OUT OF THE MONEY ▼", color: "text-rose-700 bg-rose-50 border-rose-200" };
    } else {
      return currentPrice < strike
        ? { label: "IN THE MONEY ▲", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
        : { label: "OUT OF THE MONEY ▼", color: "text-rose-700 bg-rose-50 border-rose-200" };
    }
  };

  const activePendingTrades = trades.filter((t) => t.status === "PENDING");
  const latestPendingTrade = activePendingTrades[0];
  const activeTradeForSelectedAsset = activePendingTrades.find((t) => t.symbol === selectedAsset) || null;
  const isUp = price24hChange >= 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1650px] w-full mx-auto px-3 sm:px-6 py-4 space-y-3">
        {/* Ticker Header Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-xs">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {/* Asset Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all shrink-0 ${
                    selectedAsset === asset.symbol
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {asset.pair}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0 font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 font-sans text-[9px] sm:text-[10px] block uppercase font-bold">Spot Price</span>
                <span className="text-slate-900 font-bold text-xs sm:text-sm">${livePrice < 10 ? livePrice.toFixed(4) : livePrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans text-[9px] sm:text-[10px] block uppercase font-bold">24h Change</span>
                <span className={`font-bold text-xs sm:text-sm ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
                  {isUp ? "+" : ""}{price24hChange}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-[11px]">
                <span className="text-slate-500 font-sans font-bold">Wallet: </span>
                <span className="text-emerald-600 font-bold">${personalBalance.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg font-sans text-xs font-bold transition-colors flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Transfer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Active Trade Countdown Banner */}
        {latestPendingTrade && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold">
                <Timer className="w-4 h-4 animate-spin" />
                <span>POSITION ACTIVE</span>
              </div>

              <span className="font-bold text-slate-900">
                {latestPendingTrade.symbol} {latestPendingTrade.direction} @ ${Number(latestPendingTrade.strikePrice).toFixed(2)}
              </span>

              <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] border ${getTradeLiveStatus(latestPendingTrade).color}`}>
                {getTradeLiveStatus(latestPendingTrade).label}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-sans font-bold">Countdown:</span>
                <span className="text-amber-800 font-bold text-sm bg-white px-3 py-1 rounded-lg border border-amber-200 shadow-xs">
                  ⏱️ {formatTimer(latestPendingTrade.expiresAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main 3-Column / 2-Column Exchange Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Left Column: Official TradingView Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <LiveTradingChart
              symbol={selectedAsset}
              livePrice={livePrice}
              activeStrikePrice={activeTradeForSelectedAsset ? Number(activeTradeForSelectedAsset.strikePrice) : null}
              activeDirection={activeTradeForSelectedAsset ? activeTradeForSelectedAsset.direction : null}
              remainingTimer={activeTradeForSelectedAsset ? formatTimer(activeTradeForSelectedAsset.expiresAt) : null}
              liveStatus={activeTradeForSelectedAsset ? getTradeLiveStatus(activeTradeForSelectedAsset) : null}
            />

            {/* Bottom Tabs: Positions, History, Order Book */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("POSITIONS")}
                    className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all ${
                      activeTab === "POSITIONS"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Open Positions ({activePendingTrades.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("HISTORY")}
                    className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all ${
                      activeTab === "HISTORY"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Order History ({trades.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("ORDERBOOK")}
                    className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all md:hidden ${
                      activeTab === "ORDERBOOK"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Order Book
                  </button>
                </div>
              </div>

              {activeTab === "ORDERBOOK" ? (
                <LiveOrderbook symbol={selectedAsset} livePrice={livePrice} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-2.5">Symbol</th>
                        <th className="p-2.5">Side</th>
                        <th className="p-2.5">Stake</th>
                        <th className="p-2.5">Strike Price</th>
                        <th className="p-2.5">Settlement Price</th>
                        <th className="p-2.5">Status / Countdown</th>
                        <th className="p-2.5">Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {(activeTab === "POSITIONS" ? activePendingTrades : trades).map((trade) => {
                        const isPending = trade.status === "PENDING";
                        const isWin = trade.status === "WIN";
                        const isLoss = trade.status === "LOSS";
                        const liveStatus = getTradeLiveStatus(trade);

                        return (
                          <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 font-bold text-slate-900">{trade.symbol}</td>
                            <td className="p-2.5">
                              <span
                                className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                                  trade.direction === "CALL"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {trade.direction}
                              </span>
                            </td>
                            <td className="p-2.5 font-semibold">${Number(trade.stakeAmount).toFixed(2)}</td>
                            <td className="p-2.5 font-semibold">${Number(trade.strikePrice).toFixed(2)}</td>
                            <td className="p-2.5 font-semibold">
                              {trade.settlementPrice ? `$${Number(trade.settlementPrice).toFixed(2)}` : `$${livePrice.toFixed(2)}`}
                            </td>
                            <td className="p-2.5">
                              {isPending ? (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${liveStatus.color}`}>
                                    {liveStatus.label}
                                  </span>
                                  <span className="text-amber-600 font-bold">
                                    ⏱️ {formatTimer(trade.expiresAt)}
                                  </span>
                                </div>
                              ) : (
                                <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                                  isWin ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                }`}>
                                  {trade.status}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 font-bold">
                              {isWin ? (
                                <span className="text-emerald-600">+${(Number(trade.stakeAmount) * Number(trade.payoutMultiplier)).toFixed(2)}</span>
                              ) : isLoss ? (
                                <span className="text-rose-600">$0.00</span>
                              ) : (
                                <span className="text-slate-400">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {(activeTab === "POSITIONS" ? activePendingTrades : trades).length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs font-mono">
                      No positions found. Select duration and stake to open an option order.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Binary Options Order Entry Ticket + Live Orderbook (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Order Ticket Desk</h3>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  +{winPayoutRate}% PAYOUT
                </span>
              </div>

              {/* Timeframe Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 block font-sans font-bold">Expiry Duration</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        timeframe === tf
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
                      }`}
                    >
                      {tf.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stake Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-700 font-sans font-bold">Stake Amount (USDT)</label>
                  <span className="text-slate-500 font-mono">Bal: ${personalBalance.toFixed(2)}</span>
                </div>

                {/* Quick Percentage Buttons */}
                <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setStakePercentage(pct)}
                      className="py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-blue-600 hover:bg-blue-50/50 transition-all font-bold text-[11px]"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Quick Fixed Amount Presets */}
                <div className="grid grid-cols-6 gap-1 font-mono text-[10px]">
                  {[25, 50, 100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStakeAmount(amt.toString())}
                      className={`py-1 rounded-md border text-center font-bold transition-all ${
                        stakeAmount === amt.toString()
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              {/* Institutional Risk / Reward Metrics */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Contract Stake:</span>
                  <span className="text-slate-900 font-bold">${parseFloat(stakeAmount) || 0}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Net Return (+{winPayoutRate}%):</span>
                  <span className="text-emerald-600 font-bold">+${((parseFloat(stakeAmount) || 0) * (winPayoutRate / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Payout Multiplier:</span>
                  <span className="text-blue-600 font-bold">1.75x</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold">
                  <span className="text-slate-800">Total Payout:</span>
                  <span className="text-emerald-600 font-black">${calculatedPayout.toFixed(2)}</span>
                </div>
              </div>

              {/* Notifications */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Action Trade Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1 font-sans">
                <button
                  onClick={() => handleExecuteTrade("CALL")}
                  disabled={loading}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>CALL</span>
                </button>

                <button
                  onClick={() => handleExecuteTrade("PUT")}
                  disabled={loading}
                  className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>PUT</span>
                </button>
              </div>
            </div>

            {/* Desktop Live Order Book & Executed Trades Drawer */}
            <div className="hidden lg:block space-y-2">
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs font-mono shadow-xs">
                <button
                  onClick={() => setRightDrawerTab("ORDERBOOK")}
                  className={`flex-1 py-1.5 rounded-lg font-sans text-[11px] font-bold text-center transition-all ${
                    rightDrawerTab === "ORDERBOOK" ? "bg-slate-100 text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Order Book
                </button>
                <button
                  onClick={() => setRightDrawerTab("TRADES")}
                  className={`flex-1 py-1.5 rounded-lg font-sans text-[11px] font-bold text-center transition-all ${
                    rightDrawerTab === "TRADES" ? "bg-slate-100 text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Recent Trades
                </button>
              </div>

              {rightDrawerTab === "ORDERBOOK" ? (
                <LiveOrderbook symbol={selectedAsset} livePrice={livePrice} />
              ) : (
                <LiveTradesStream symbol={selectedAsset} livePrice={livePrice} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <WalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={{ holdingBalance, botBalance: 0, personalTradingBalance: personalBalance }}
        onSuccess={fetchTradesAndWallet}
      />
    </div>
  );
}
