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
  Lock,
} from "lucide-react";

export default function OptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSDT");
  const [timeframe, setTimeframe] = useState<string>("1m");
  const [livePrice, setLivePrice] = useState<number>(94520.5);

  const [personalBalance, setPersonalBalance] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>("50");
  const [winPayoutRate, setWinPayoutRate] = useState<number>(75);

  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  const assets = [
    { symbol: "BTCUSDT", name: "Bitcoin", icon: "₿" },
    { symbol: "ETHUSDT", name: "Ethereum", icon: "Ξ" },
    { symbol: "SOLUSDT", name: "Solana", icon: "◎" },
    { symbol: "XRPUSDT", name: "Ripple", icon: "✕" },
    { symbol: "DOGEUSDT", name: "Dogecoin", icon: "Ð" },
    { symbol: "BNBUSDT", name: "Binance Coin", icon: "Ƀ" },
  ];

  const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "daily"];

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
        setPersonalBalance(walletData.personalTradingBalance || 0);
      }

      if (botRes.ok) {
        const botData = await botRes.json();
        if (botData.globalConfig?.binaryOptionWinRate) {
          setWinPayoutRate(botData.globalConfig.binaryOptionWinRate);
        }
      }
    } catch (e) {
      console.error("Options page fetch error", e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTradesAndWallet();
      const interval = setInterval(fetchTradesAndWallet, 3000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Auto-settlement trigger on expired trades
  useEffect(() => {
    const settleWorker = async () => {
      if (session && livePrice > 0) {
        try {
          await fetch("/api/options", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              symbolPrices: { [selectedAsset]: livePrice },
            }),
          });
        } catch (e) {
          console.error(e);
        }
      }
    };

    const interval = setInterval(settleWorker, 3000);
    return () => clearInterval(interval);
  }, [session, livePrice, selectedAsset]);

  const handlePlaceTrade = async (direction: "CALL" | "PUT") => {
    // REQUIRE LOGIN BEFORE PLACING BET
    if (status !== "authenticated" || !session) {
      router.push("/login?callbackUrl=/options");
      return;
    }

    setError(null);
    setSuccessMsg(null);

    const stake = parseFloat(stakeAmount);
    if (isNaN(stake) || stake <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    if (stake > personalBalance) {
      setError(`Insufficient Personal Trading Balance ($${personalBalance.toFixed(2)})`);
      return;
    }

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
      if (!res.ok) {
        throw new Error(data.error || "Trade execution failed");
      }

      setSuccessMsg(
        `Binary Option ${direction} order executed @ strike $${livePrice.toLocaleString()}!`
      );
      fetchTradesAndWallet();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to place trade");
    } finally {
      setLoading(false);
    }
  };

  const setPercentageStake = (pct: number) => {
    if (!session) {
      router.push("/login?callbackUrl=/options");
      return;
    }
    const val = (personalBalance * (pct / 100)).toFixed(2);
    setStakeAmount(val);
  };

  const activePendingTrade = trades.find((t) => t.status === "PENDING" && t.symbol === selectedAsset);
  const expectedPayout = (parseFloat(stakeAmount || "0") * (1 + winPayoutRate / 100)).toFixed(2);

  const isPriceWinning =
    activePendingTrade &&
    ((activePendingTrade.direction === "CALL" && livePrice > activePendingTrade.strikePrice) ||
      (activePendingTrade.direction === "PUT" && livePrice < activePendingTrade.strikePrice));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ASSET SELECTOR & TIMEFRAMES */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {assets.map((asset) => {
              const isSelected = selectedAsset === asset.symbol;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 shadow-lg shadow-sky-500/25 scale-105"
                      : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <span className="w-5 h-5 rounded-lg bg-slate-950/40 flex items-center justify-center text-xs font-bold">
                    {asset.icon}
                  </span>
                  <span>{asset.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    {asset.symbol.replace("USDT", "")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">
              Expiry:
            </span>
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                  timeframe === tf
                    ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN TERMINAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* REAL TRADINGVIEW STYLE LIVE CHART */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800/90 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                    {selectedAsset}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    LIVE TICK STREAM
                  </span>
                </div>
                <div className="flex items-baseline gap-4 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-mono">
                    +{winPayoutRate}% Win Multiplier
                  </span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Personal Options Wallet
                </span>
                <span className="text-lg font-black font-mono text-sky-400">
                  {session ? `$${personalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "Login Required"}
                </span>
              </div>
            </div>

            {/* Active Trade Banner Alert */}
            {activePendingTrade && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition animate-pulse ${
                  isPriceWinning
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2 font-mono">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">
                    ACTIVE {activePendingTrade.direction} POSITION @ STRIKE ${activePendingTrade.strikePrice}
                  </span>
                </div>
                <span className="font-mono text-white font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {Math.max(0, Math.ceil((new Date(activePendingTrade.expiresAt).getTime() - nowTime) / 1000))}s REMAINING
                </span>
              </div>
            )}

            {/* LIVE REAL-TIME RECHARTS COMPONENT */}
            <LiveTradingChart
              symbol={selectedAsset}
              livePrice={livePrice}
              activeStrikePrice={activePendingTrade?.strikePrice ? Number(activePendingTrade.strikePrice) : null}
              activeDirection={activePendingTrade?.direction || null}
              height={360}
            />
          </div>

          {/* ORDER ENTRY & STAKE PANEL */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Order Execution
                </h3>
                <span className="text-xs text-sky-400 font-mono font-bold">Expiry: {timeframe}</span>
              </div>

              {!session && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Authentication required to place live binary option bets.</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Stake Amount Input */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Stake Amount ($)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {session ? `Personal Balance: $${personalBalance.toFixed(2)}` : "Login to View Balance"}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none font-bold"
                    placeholder="50"
                  />
                </div>

                {/* Stake Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStakeAmount(amt.toString())}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono border border-slate-800 font-bold transition"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {/* Percentage Stake Bar */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentageStake(pct)}
                      className="py-1 bg-slate-950 hover:bg-slate-900 text-sky-400 rounded-lg text-[10px] font-mono border border-slate-800 font-bold transition"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Live Sentiment Meter */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span className="text-emerald-400">CALL SENTIMENT: 68%</span>
                    <span className="text-rose-400">PUT: 32%</span>
                  </div>
                  <div className="h-1.5 w-full bg-rose-500/40 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[68%]"></div>
                  </div>
                </div>

                {/* Expected Return Calculator */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Configured Win Payout:</span>
                    <span className="text-emerald-400 font-bold font-mono">+{winPayoutRate}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Entry Strike Price:</span>
                    <span className="font-mono text-white font-bold">${livePrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                    <span className="text-white">Est. Win Return:</span>
                    <span className="font-mono text-emerald-400">${expectedPayout}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CALL / PUT EXECUTION BUTTONS */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePlaceTrade("CALL")}
                disabled={loading}
                className="py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  <span>HIGHER (CALL)</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">
                  {session ? "Price will rise" : "Login Required to Bet"}
                </span>
              </button>

              <button
                onClick={() => handlePlaceTrade("PUT")}
                disabled={loading}
                className="py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-5 h-5" />
                  <span>LOWER (PUT)</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">
                  {session ? "Price will fall" : "Login Required to Bet"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* TRADES AUDIT & LIVE COUNTDOWN HISTORY */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" />
              Active & Settled Binary Option Trades
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Auto-Settlement Engine Active
            </span>
          </div>

          {!session ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
              <p>Please log in to view your binary option trades audit and live active countdowns.</p>
              <button
                onClick={() => router.push("/login?callbackUrl=/options")}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Sign In to Trade
              </button>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
              No options trades found. Select 1m or 5m expiry above and place a trade!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Asset</th>
                    <th className="pb-3 px-3">Direction</th>
                    <th className="pb-3 px-3">Stake</th>
                    <th className="pb-3 px-3">Strike Price</th>
                    <th className="pb-3 px-3">Settlement Price</th>
                    <th className="pb-3 px-3">Timeframe</th>
                    <th className="pb-3 px-3">Countdown / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {trades.map((t) => {
                    const remainingSec = Math.max(
                      0,
                      Math.ceil((new Date(t.expiresAt).getTime() - nowTime) / 1000)
                    );

                    return (
                      <tr key={t.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-3 font-bold text-white">{t.symbol}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              t.direction === "CALL"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">${t.stakeAmount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-slate-300">${t.strikePrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-300">
                          {t.settlementPrice ? `$${t.settlementPrice.toLocaleString()}` : "---"}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{t.expiryTimeframe}</td>
                        <td className="py-3 px-3">
                          {t.status === "PENDING" ? (
                            <span className="font-bold px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                              PENDING ({remainingSec}s)
                            </span>
                          ) : (
                            <span
                              className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                                t.status === "WIN"
                                  ? "bg-emerald-500 text-slate-950 shadow-md"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {t.status}
                            </span>
                          )}
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
    </div>
  );
}
