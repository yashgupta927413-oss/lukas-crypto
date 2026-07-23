"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import LiveTradingChart from "@/components/live-trading-chart";
import Footer from "@/components/footer";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import WalletTransferModal from "@/components/wallet-transfer-modal";

export default function OptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSDT");
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [livePrice, setLivePrice] = useState<number>(94520.5);

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
      const [tradeRes, walletRes, botRes] = await Promise.all([
        fetch("/api/options"),
        fetch("/api/user/wallet"),
        fetch("/api/bots"),
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
    } catch (e) {
      console.error("Options page fetch error", e);
    }
  };

  useEffect(() => {
    fetchTradesAndWallet();
    const interval = setInterval(fetchTradesAndWallet, 2000);
    return () => clearInterval(interval);
  }, [session]);

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

  // Helper to determine live PnL status for pending trades
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

  // Active pending trades
  const activePendingTrades = trades.filter((t) => t.status === "PENDING");
  const latestPendingTrade = activePendingTrades[0];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Pair Header & Asset Selector */}
        <div className="bg-[#181a20] border border-[#2b313a] rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {assets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset.symbol)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  selectedAsset === asset.symbol
                    ? "bg-[#2b313a] text-[#f0b90b] font-bold"
                    : "text-[#848e9c] hover:text-white hover:bg-[#1e2329]"
                }`}
              >
                {asset.pair}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-[#0b0e11] px-3 py-1 rounded border border-[#2b313a]">
              <span className="text-[#848e9c] font-sans">Options Wallet: </span>
              <span className="text-[#0ecb81] font-bold">${personalBalance.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 bg-[#2b313a] hover:bg-[#474d57] text-white rounded text-xs font-semibold transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#f0b90b]" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Live Active Trade Countdown & Real-Time PnL Status Banner */}
        {latestPendingTrade && (
          <div className="bg-[#181a20] border border-[#2b313a] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#f0b90b]/10 text-[#f0b90b] border border-[#f0b90b]/30 font-bold">
                <Timer className="w-4 h-4 animate-spin" />
                <span>POSITION ACTIVE</span>
              </div>

              <span className="font-bold text-white">
                {latestPendingTrade.symbol} {latestPendingTrade.direction} @ ${Number(latestPendingTrade.strikePrice).toFixed(2)}
              </span>

              {/* Real-time Status Badge (Green / Red / Blue) */}
              <span className={`px-2.5 py-1 rounded border font-bold text-[11px] ${getTradeLiveStatus(latestPendingTrade).color}`}>
                {getTradeLiveStatus(latestPendingTrade).label}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[#848e9c] font-sans">Countdown:</span>
                <span className="text-[#f0b90b] font-bold text-sm bg-[#0b0e11] px-3 py-1 rounded border border-[#2b313a]">
                  ⏱️ {formatTimer(latestPendingTrade.expiresAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#848e9c] font-sans">Live Spot:</span>
                <span className="text-white font-bold">${livePrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Trading Desk Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Official TradingView Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <LiveTradingChart
              symbol={selectedAsset}
              livePrice={livePrice}
            />
          </div>

          {/* Right Column: Binary Options Order Entry Ticket (4 cols) */}
          <div className="lg:col-span-4 bg-[#181a20] border border-[#2b313a] rounded-lg p-5 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-[#2b313a]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Order Ticket</h3>
              <span className="text-xs font-mono font-bold text-[#0ecb81]">
                +{winPayoutRate}% PAYOUT
              </span>
            </div>

            {/* Timeframe Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#848e9c] block font-sans">Duration</label>
              <div className="grid grid-cols-3 gap-2 font-mono">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`py-1.5 rounded text-xs font-bold transition-colors ${
                      timeframe === tf
                        ? "bg-[#f0b90b] text-[#0b0e11]"
                        : "bg-[#0b0e11] text-[#848e9c] hover:text-white border border-[#2b313a]"
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Stake Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#848e9c] block font-sans">Amount (USDT)</label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs mb-1.5">
                {["25", "50", "100", "500"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStakeAmount(amt)}
                    className={`py-1 rounded border text-center transition-colors ${
                      stakeAmount === amt
                        ? "bg-[#2b313a] border-[#f0b90b] text-[#f0b90b] font-bold"
                        : "bg-[#0b0e11] border-[#2b313a] text-[#848e9c] hover:text-white"
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
                className="w-full bg-[#0b0e11] border border-[#2b313a] rounded px-3 py-2 text-sm font-mono font-bold text-white outline-none focus:border-[#f0b90b]"
              />
            </div>

            {/* Summary */}
            <div className="p-3 bg-[#0b0e11] rounded border border-[#2b313a] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#848e9c]">
                <span>Stake Amount:</span>
                <span className="text-white font-bold">${parseFloat(stakeAmount) || 0}</span>
              </div>
              <div className="flex justify-between text-[#848e9c]">
                <span>Est. Return ({winPayoutRate}%):</span>
                <span className="text-[#0ecb81] font-bold">+${((parseFloat(stakeAmount) || 0) * (winPayoutRate / 100)).toFixed(2)}</span>
              </div>
              <div className="pt-1.5 border-t border-[#2b313a] flex justify-between text-xs font-bold">
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
                className="py-3 bg-[#0ecb81] hover:bg-[#0bb572] text-[#0b0e11] font-bold rounded text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <TrendingUp className="w-4 h-4" />
                <span>CALL</span>
              </button>

              <button
                onClick={() => handleExecuteTrade("PUT")}
                disabled={loading}
                className="py-3 bg-[#f6465d] hover:bg-[#e0354c] text-white font-bold rounded text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <TrendingDown className="w-4 h-4" />
                <span>PUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* ORDER HISTORY TABLE */}
        <div className="bg-[#181a20] border border-[#2b313a] rounded-lg p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f0b90b]" />
              Trade History &amp; Open Positions
            </h3>
            <span className="text-xs text-[#848e9c] font-mono">Orders: {trades.length}</span>
          </div>

          {trades.length === 0 ? (
            <div className="text-center py-8 text-[#848e9c] text-xs bg-[#0b0e11] rounded border border-[#2b313a]">
              No active or previous orders. Select a timeframe and stake to place your order.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b0e11] text-[#848e9c] uppercase text-[10px] border-b border-[#2b313a]">
                  <tr>
                    <th className="p-2.5">Symbol</th>
                    <th className="p-2.5">Side</th>
                    <th className="p-2.5">Stake</th>
                    <th className="p-2.5">Strike Price</th>
                    <th className="p-2.5">Settlement Price</th>
                    <th className="p-2.5">Live Status / Countdown</th>
                    <th className="p-2.5">Payout</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b313a]/50 text-slate-200">
                  {trades.map((trade) => {
                    const isPending = trade.status === "PENDING";
                    const isWin = trade.status === "WIN";
                    const isLoss = trade.status === "LOSS";
                    const liveStatus = getTradeLiveStatus(trade);

                    return (
                      <tr key={trade.id} className="hover:bg-[#1e2329] transition-colors">
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
                            <span className="text-[#848e9c]">Settled</span>
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
                        <td className="p-2.5">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              isWin
                                ? "bg-[#0ecb81]/10 text-[#0ecb81]"
                                : isLoss
                                ? "bg-[#f6465d]/10 text-[#f6465d]"
                                : "bg-[#f0b90b]/10 text-[#f0b90b]"
                            }`}
                          >
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
