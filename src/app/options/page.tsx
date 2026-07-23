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
  Zap,
  CheckCircle2,
  AlertCircle,
  Flame,
  Wallet,
  ArrowRightLeft,
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
    { symbol: "BTCUSDT", name: "Bitcoin", icon: "₿" },
    { symbol: "ETHUSDT", name: "Ethereum", icon: "Ξ" },
    { symbol: "SOLUSDT", name: "Solana", icon: "◎" },
    { symbol: "XRPUSDT", name: "Ripple", icon: "✕" },
    { symbol: "DOGEUSDT", name: "Dogecoin", icon: "Ð" },
    { symbol: "BNBUSDT", name: "Binance Coin", icon: "Ƀ" },
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
    const interval = setInterval(fetchTradesAndWallet, 3000);
    return () => clearInterval(interval);
  }, [session]);

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
      setError(`Insufficient trading balance. Transfer funds to Personal Trading Wallet.`);
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
        setSuccessMsg(`🚀 ${direction} Position Opened @ $${data.strikePrice}`);
        fetchTradesAndWallet();
      } else {
        setError(data.error || "Failed to execute trade");
      }
    } catch (e: any) {
      setError(e.message || "Error executing position");
    } finally {
      setLoading(false);
    }
  };

  const calculatedPayout = (parseFloat(stakeAmount) || 0) * (1 + winPayoutRate / 100);

  const activePendingTrade = trades.find(
    (t) => t.status === "PENDING" && new Date(t.expiresAt).getTime() > nowTime
  );

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Asset & Header Bar */}
        <div className="bg-[#121722] border border-[#1e2638] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Asset Selector */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedAsset === asset.symbol
                      ? "bg-[#192233] text-white border border-[#2b374e]"
                      : "text-slate-400 hover:text-white hover:bg-[#0b0e14]"
                  }`}
                >
                  <span className="text-[#f0b90b] font-bold">{asset.icon}</span>
                  <span>{asset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Balance & Transfer */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-[#0b0e14] px-3.5 py-1.5 rounded-xl border border-[#1e2638]">
              <span className="text-slate-400 font-sans">Options Wallet: </span>
              <span className="text-[#0ecb81] font-bold">${personalBalance.toFixed(2)}</span>
            </div>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#192233] hover:bg-[#232c40] text-slate-200 rounded-xl text-xs font-bold border border-[#2b374e] transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#f0b90b]" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Main Trading Desk Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Official Binance TradingView Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <LiveTradingChart
              symbol={selectedAsset}
              livePrice={livePrice}
              activeStrikePrice={activePendingTrade?.strikePrice ? Number(activePendingTrade.strikePrice) : null}
              activeDirection={activePendingTrade?.direction || null}
              height={480}
            />
          </div>

          {/* Right Column: Binary Options Order Desk (4 cols) */}
          <div className="lg:col-span-4 bg-[#121722] border border-[#1e2638] rounded-2xl p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-white">Options Order Desk</h3>
                <span className="text-[10px] font-mono font-bold text-[#0ecb81] bg-[#0ecb81]/10 px-2 py-0.5 rounded border border-[#0ecb81]/30">
                  {winPayoutRate}% PAYOUT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predict direction at settlement expiry to earn fixed +{winPayoutRate}% ROI.
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Expiry Duration</label>
              <div className="grid grid-cols-3 gap-2 font-mono">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      timeframe === tf
                        ? "bg-[#f0b90b] text-[#0b0e14] shadow"
                        : "bg-[#0b0e14] text-slate-400 hover:text-white border border-[#1e2638]"
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Stake Amount Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Stake Amount ($ USD)</label>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs mb-2">
                {["25", "50", "100", "500"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStakeAmount(amt)}
                    className={`py-1.5 rounded-lg border text-center transition-all ${
                      stakeAmount === amt
                        ? "bg-[#192233] border-[#38bdf8] text-white font-bold"
                        : "bg-[#0b0e14] border-[#1e2638] text-slate-400 hover:text-white"
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
                className="w-full bg-[#0b0e14] border border-[#1e2638] rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white outline-none focus:border-[#38bdf8]"
              />
            </div>

            {/* Payout Summary Box */}
            <div className="p-4 bg-[#0b0e14] rounded-xl border border-[#1e2638] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Investment Stake:</span>
                <span className="text-white font-bold">${parseFloat(stakeAmount) || 0}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Profit Return ({winPayoutRate}%):</span>
                <span className="text-[#0ecb81] font-bold">+${((parseFloat(stakeAmount) || 0) * (winPayoutRate / 100)).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#1e2638] flex justify-between text-sm font-bold">
                <span className="text-slate-200">Total Payout:</span>
                <span className="text-[#0ecb81]">${calculatedPayout.toFixed(2)}</span>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="p-3 bg-[#f6465d]/10 border border-[#f6465d]/30 rounded-xl text-xs text-[#f6465d] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-[#0ecb81]/10 border border-[#0ecb81]/30 rounded-xl text-xs text-[#0ecb81] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action Trade Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleExecuteTrade("CALL")}
                disabled={loading}
                className="py-3.5 bg-[#0ecb81] hover:bg-[#0bb572] text-[#0b0e14] font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <TrendingUp className="w-5 h-5" />
                <span>CALL</span>
              </button>

              <button
                onClick={() => handleExecuteTrade("PUT")}
                disabled={loading}
                className="py-3.5 bg-[#f6465d] hover:bg-[#e0354c] text-white font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <TrendingDown className="w-5 h-5" />
                <span>PUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* ORDER HISTORY TABLE */}
        <div className="bg-[#121722] border border-[#1e2638] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#f0b90b]" />
              Position &amp; Order History
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total Positions: {trades.length}</span>
          </div>

          {trades.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs bg-[#0b0e14] rounded-xl border border-[#1e2638]">
              No positions open yet. Select a timeframe &amp; stake amount to launch your first options trade.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b0e14] text-slate-400 uppercase text-[10px] border-b border-[#1e2638]">
                  <tr>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Direction</th>
                    <th className="p-3">Stake</th>
                    <th className="p-3">Strike Price</th>
                    <th className="p-3">Settlement</th>
                    <th className="p-3">Payout</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2638]/60 text-slate-200">
                  {trades.map((trade) => {
                    const isPending = trade.status === "PENDING";
                    const isWin = trade.status === "WIN";
                    const isLoss = trade.status === "LOSS";

                    return (
                      <tr key={trade.id} className="hover:bg-[#1a2130]/50 transition-colors">
                        <td className="p-3 font-bold text-white">{trade.symbol}</td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              trade.direction === "CALL"
                                ? "bg-[#0ecb81]/10 text-[#0ecb81]"
                                : "bg-[#f6465d]/10 text-[#f6465d]"
                            }`}
                          >
                            {trade.direction}
                          </span>
                        </td>
                        <td className="p-3">${Number(trade.stakeAmount).toFixed(2)}</td>
                        <td className="p-3">${Number(trade.strikePrice).toFixed(2)}</td>
                        <td className="p-3">
                          {trade.settlementPrice ? `$${Number(trade.settlementPrice).toFixed(2)}` : "—"}
                        </td>
                        <td className="p-3 font-bold">
                          {isWin ? (
                            <span className="text-[#0ecb81]">+${(Number(trade.stakeAmount) * Number(trade.payoutMultiplier)).toFixed(2)}</span>
                          ) : isLoss ? (
                            <span className="text-[#f6465d]">$0.00</span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              isWin
                                ? "bg-[#0ecb81]/10 text-[#0ecb81] border border-[#0ecb81]/30"
                                : isLoss
                                ? "bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/30"
                                : "bg-[#f0b90b]/10 text-[#f0b90b] border border-[#f0b90b]/30 animate-pulse"
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
