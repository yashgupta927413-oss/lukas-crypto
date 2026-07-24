"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      }
    } catch (e) {
      console.error("Options page fetch error", e);
    }
  };

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

    if (expiredPending && livePrice > 0) {
      fetch("/api/options", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbolPrices: { [expiredPending.symbol]: livePrice } }),
      }).then(() => fetchTradesAndWallet());
    }
  }, [nowTime, trades, livePrice]);

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

  // Helper to determine live PnL status
  const getTradeLiveStatus = (trade: any) => {
    const strike = Number(trade.strikePrice);
    if (livePrice === strike) return { label: "STRIKE MATCH", color: "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30" };
    if (trade.direction === "CALL") {
      return livePrice > strike
        ? { label: "IN THE MONEY ▲", color: "text-[#0ecb81] bg-[#0ecb81]/10 border-[#0ecb81]/30" }
        : { label: "OUT OF THE MONEY ▼", color: "text-[#f6465d] bg-[#f6465d]/10 border-[#f6465d]/30" };
    } else {
      return livePrice < strike
        ? { label: "IN THE MONEY ▲", color: "text-[#0ecb81] bg-[#0ecb81]/10 border-[#0ecb81]/30" }
        : { label: "OUT OF THE MONEY ▼", color: "text-[#f6465d] bg-[#f6465d]/10 border-[#f6465d]/30" };
    }
  };

  const activePendingTrades = trades.filter((t) => t.status === "PENDING");
  const latestPendingTrade = activePendingTrades[0];
  const isUp = price24hChange >= 0;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1650px] w-full mx-auto px-3 sm:px-6 py-4 space-y-3">
        {/* Ticker Header Bar */}
        <div className="bg-[#12161f] border border-[#263044] rounded-lg p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {/* Asset Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`px-2.5 py-1.5 rounded font-sans text-xs font-bold transition-all shrink-0 ${
                    selectedAsset === asset.symbol
                      ? "bg-[#263044] text-[#f0b90b] shadow"
                      : "text-[#848e9c] hover:text-white hover:bg-[#181e2a]"
                  }`}
                >
                  {asset.pair}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#263044] pt-2 sm:pt-0 font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[#848e9c] font-sans text-[9px] sm:text-[10px] block uppercase">Spot Price</span>
                <span className="text-white font-bold text-xs sm:text-sm">${livePrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#848e9c] font-sans text-[9px] sm:text-[10px] block uppercase">24h Change</span>
                <span className={`font-bold text-xs sm:text-sm ${isUp ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                  {isUp ? "+" : ""}{price24hChange}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-[#0b0e11] px-2.5 py-1 rounded border border-[#263044] text-[11px]">
                <span className="text-[#848e9c] font-sans">Wallet: </span>
                <span className="text-[#0ecb81] font-bold">${personalBalance.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-2.5 py-1 bg-[#263044] hover:bg-[#323e57] text-white rounded font-sans text-xs font-bold transition-colors flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3 h-3 text-[#f0b90b]" />
                <span className="hidden sm:inline">Transfer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Active Trade Countdown Banner */}
        {latestPendingTrade && (
          <div className="bg-[#12161f] border border-[#f0b90b]/40 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#f0b90b]/10 text-[#f0b90b] border border-[#f0b90b]/30 font-bold">
                <Timer className="w-4 h-4 animate-spin" />
                <span>POSITION ACTIVE</span>
              </div>

              <span className="font-bold text-white">
                {latestPendingTrade.symbol} {latestPendingTrade.direction} @ ${Number(latestPendingTrade.strikePrice).toFixed(2)}
              </span>

              <span className={`px-2.5 py-0.5 rounded border font-bold text-[10px] ${getTradeLiveStatus(latestPendingTrade).color}`}>
                {getTradeLiveStatus(latestPendingTrade).label}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[#848e9c] font-sans">Countdown:</span>
                <span className="text-[#f0b90b] font-bold text-sm bg-[#0b0e11] px-3 py-1 rounded border border-[#263044]">
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
            />

            {/* Bottom Tabs: Positions, History, Order Book */}
            <div className="bg-[#12161f] border border-[#263044] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#263044] pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("POSITIONS")}
                    className={`px-3 py-1.5 rounded font-sans text-xs font-bold transition-all ${
                      activeTab === "POSITIONS"
                        ? "bg-[#263044] text-[#f0b90b]"
                        : "text-[#848e9c] hover:text-white"
                    }`}
                  >
                    Open Positions ({activePendingTrades.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("HISTORY")}
                    className={`px-3 py-1.5 rounded font-sans text-xs font-bold transition-all ${
                      activeTab === "HISTORY"
                        ? "bg-[#263044] text-[#f0b90b]"
                        : "text-[#848e9c] hover:text-white"
                    }`}
                  >
                    Order History ({trades.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("ORDERBOOK")}
                    className={`px-3 py-1.5 rounded font-sans text-xs font-bold transition-all md:hidden ${
                      activeTab === "ORDERBOOK"
                        ? "bg-[#263044] text-[#f0b90b]"
                        : "text-[#848e9c] hover:text-white"
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
                    <thead className="bg-[#0b0e11] text-[#848e9c] uppercase text-[10px] border-b border-[#263044]">
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
                    <tbody className="divide-y divide-[#263044]/50 text-slate-200">
                      {(activeTab === "POSITIONS" ? activePendingTrades : trades).map((trade) => {
                        const isPending = trade.status === "PENDING";
                        const isWin = trade.status === "WIN";
                        const isLoss = trade.status === "LOSS";
                        const liveStatus = getTradeLiveStatus(trade);

                        return (
                          <tr key={trade.id} className="hover:bg-[#181e2a] transition-colors">
                            <td className="p-2.5 font-bold text-white">{trade.symbol}</td>
                            <td className="p-2.5">
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                  trade.direction === "CALL"
                                    ? "bg-[#0ecb81]/10 text-[#0ecb81]"
                                    : "bg-[#f6465d]/10 text-[#f6465d]"
                                }`}
                              >
                                {trade.direction}
                              </span>
                            </td>
                            <td className="p-2.5">${Number(trade.stakeAmount).toFixed(2)}</td>
                            <td className="p-2.5">${Number(trade.strikePrice).toFixed(2)}</td>
                            <td className="p-2.5">
                              {trade.settlementPrice ? `$${Number(trade.settlementPrice).toFixed(2)}` : `$${livePrice.toFixed(2)}`}
                            </td>
                            <td className="p-2.5">
                              {isPending ? (
                                <div className="flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] border ${liveStatus.color}`}>
                                    {liveStatus.label}
                                  </span>
                                  <span className="text-[#f0b90b] font-bold">
                                    ⏱️ {formatTimer(trade.expiresAt)}
                                  </span>
                                </div>
                              ) : (
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                  isWin ? "bg-[#0ecb81]/10 text-[#0ecb81]" : "bg-[#f6465d]/10 text-[#f6465d]"
                                }`}>
                                  {trade.status}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 font-bold">
                              {isWin ? (
                                <span className="text-[#0ecb81]">+${(Number(trade.stakeAmount) * Number(trade.payoutMultiplier)).toFixed(2)}</span>
                              ) : isLoss ? (
                                <span className="text-[#f6465d]">$0.00</span>
                              ) : (
                                <span className="text-[#848e9c]">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {(activeTab === "POSITIONS" ? activePendingTrades : trades).length === 0 && (
                    <div className="text-center py-6 text-[#848e9c] text-xs font-mono">
                      No positions found. Select duration and stake to open an option order.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Binary Options Order Entry Ticket + Live Orderbook (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-[#12161f] border border-[#263044] rounded-lg p-5 space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-[#263044]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Order Ticket Desk</h3>
                <span className="text-xs font-mono font-bold text-[#0ecb81]">
                  +{winPayoutRate}% PAYOUT
                </span>
              </div>

              {/* Timeframe Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#848e9c] block font-sans">Expiry Duration</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`py-1.5 rounded text-xs font-bold transition-all ${
                        timeframe === tf
                          ? "bg-[#f0b90b] text-[#0b0e11] shadow"
                          : "bg-[#0b0e11] text-[#848e9c] hover:text-white border border-[#263044]"
                      }`}
                    >
                      {tf.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stake Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-[#848e9c] font-sans">Stake Amount (USDT)</label>
                  <span className="text-[#848e9c] font-mono">Bal: ${personalBalance.toFixed(2)}</span>
                </div>

                {/* Quick Percentage Buttons */}
                <div className="grid grid-cols-4 gap-1.5 font-mono text-xs mb-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setStakePercentage(pct)}
                      className="py-1 rounded border border-[#263044] bg-[#0b0e11] text-[#848e9c] hover:text-white hover:border-[#f0b90b] transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-[#0b0e11] border border-[#263044] rounded px-3 py-2 text-sm font-mono font-bold text-white outline-none focus:border-[#f0b90b]"
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-[#0b0e11] rounded border border-[#263044] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#848e9c]">
                  <span>Stake Amount:</span>
                  <span className="text-white font-bold">${parseFloat(stakeAmount) || 0}</span>
                </div>
                <div className="flex justify-between text-[#848e9c]">
                  <span>Est. Profit ({winPayoutRate}%):</span>
                  <span className="text-[#0ecb81] font-bold">+${((parseFloat(stakeAmount) || 0) * (winPayoutRate / 100)).toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-[#263044] flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Total Payout:</span>
                  <span className="text-[#0ecb81]">${calculatedPayout.toFixed(2)}</span>
                </div>
              </div>

              {/* Notifications */}
              {error && (
                <div className="p-2.5 bg-[#f6465d]/10 border border-[#f6465d]/30 rounded text-xs text-[#f6465d] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 bg-[#0ecb81]/10 border border-[#0ecb81]/30 rounded text-xs text-[#0ecb81] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Action Trade Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleExecuteTrade("CALL")}
                  disabled={loading}
                  className="py-3 bg-[#0ecb81] hover:bg-[#0bb572] text-[#0b0e11] font-bold rounded text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>CALL</span>
                </button>

                <button
                  onClick={() => handleExecuteTrade("PUT")}
                  disabled={loading}
                  className="py-3 bg-[#f6465d] hover:bg-[#e0354c] text-white font-bold rounded text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>PUT</span>
                </button>
              </div>
            </div>

            {/* Desktop Live Order Book & Executed Trades Drawer */}
            <div className="hidden lg:block space-y-2">
              <div className="flex items-center gap-1 bg-[#12161f] border border-[#263044] p-1 rounded-lg text-xs font-mono">
                <button
                  onClick={() => setRightDrawerTab("ORDERBOOK")}
                  className={`flex-1 py-1.5 rounded font-sans text-[11px] font-bold text-center transition-all ${
                    rightDrawerTab === "ORDERBOOK" ? "bg-[#263044] text-[#f0b90b]" : "text-[#848e9c] hover:text-white"
                  }`}
                >
                  Order Book
                </button>
                <button
                  onClick={() => setRightDrawerTab("TRADES")}
                  className={`flex-1 py-1.5 rounded font-sans text-[11px] font-bold text-center transition-all ${
                    rightDrawerTab === "TRADES" ? "bg-[#263044] text-[#f0b90b]" : "text-[#848e9c] hover:text-white"
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
