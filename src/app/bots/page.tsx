"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Bot,
  Gift,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function BotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tiers, setTiers] = useState<any[]>([]);
  const [globalConfig, setGlobalConfig] = useState<any>({ trialCreditAmount: 100, minBotDeposit: 500 });
  const [contracts, setContracts] = useState<any[]>([]);
  const [holdingBalance, setHoldingBalance] = useState<number>(0);

  const [selectedTier, setSelectedTier] = useState<any | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>("400");
  const [useTrialCredit, setUseTrialCredit] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [botRes, walletRes] = await Promise.all([
        fetch("/api/bots"),
        fetch("/api/user/wallet"),
      ]);

      if (botRes.ok) {
        const data = await botRes.json();
        setTiers(data.tiers || []);
        setGlobalConfig(data.globalConfig || {});
        setContracts(data.contracts || []);
      }

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setHoldingBalance(walletData.holdingBalance || 0);
      }
    } catch (e) {
      console.error("Error loading bots data", e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const handleActivateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const topUp = parseFloat(topUpAmount);
    if (isNaN(topUp) || topUp < 0) {
      setError("Please enter a valid top-up amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACTIVATE",
          tierId: selectedTier.id,
          topUpAmount: topUp,
          useTrialCredit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bot activation failed");
      }

      setSuccessMsg("AI Bot Contract activated successfully! Funds locked & generating daily yield.");
      setSelectedTier(null);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to activate bot contract");
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseContract = async (contractId: string) => {
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RELEASE",
          contractId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Release failed");
      }

      setSuccessMsg(`Contract matured! $${data.totalReleaseAmount.toFixed(2)} transferred back to Holding Wallet.`);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const hasUsedTrial = contracts.some((c) => c.trialBonusUsed > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>QUANTITATIVE AI ALGORITHMIC YIELD ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              AI Bot Investment Hub
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Commit funds to high-frequency algorithmic trading bots. Earn daily yields injected directly into your contract allocation.
            </p>
          </div>
        </div>

        {/* $100 Free Trial Credit Status Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-sky-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  ${globalConfig.trialCreditAmount || 100} Free Trial Bonus Allocation
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasUsedTrial
                      ? "bg-slate-800 text-slate-400 border border-slate-700"
                      : "bg-emerald-500 text-slate-950 shadow-md"
                  }`}
                >
                  {hasUsedTrial ? "REDEEMED" : "AVAILABLE NOW"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {hasUsedTrial
                  ? "You have already claimed your $100 free trial bonus on an active/completed contract."
                  : "Combine your $100 Free Trial Credit with a minimum $400 top-up from Holding Wallet to reach the required $500 principal!"}
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* BOT TIERS GRID */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Select AI Trading Bot Plan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between border border-slate-800 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      {tier.durationDays} DAYS DURATION
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      +{tier.minRoiPercent}% EST. ROI
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white mb-1">{tier.name}</h3>

                  <div className="my-4 py-3 border-y border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Minimum Principal:</span>
                      <strong className="text-white font-mono">${tier.minDeposit.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Maximum Deposit:</span>
                      <strong className="text-white font-mono">${tier.maxDeposit.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Trial Credit Eligible:</span>
                      <strong className="text-emerald-400 font-semibold">YES ($100 Bonus)</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!session) {
                      router.push("/login?callbackUrl=/bots");
                      return;
                    }
                    setSelectedTier(tier);
                    setUseTrialCredit(!hasUsedTrial);
                    setTopUpAmount(hasUsedTrial ? tier.minDeposit.toString() : "400");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>Activate Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* USER CONTRACTS LIST */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                My AI Bot Portfolio & Daily Yield Logs
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily profits are updated daily via the Admin Panel and added directly to your accumulated yield below.
              </p>
            </div>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
              No active or previous bot contracts found. Select a bot tier above to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((c) => {
                const isExpanded = expandedContractId === c.id;
                const isMatured = new Date() >= new Date(c.endDate);

                return (
                  <div
                    key={c.id}
                    className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden transition"
                  >
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white">{c.tierName}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === "ACTIVE"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4 font-mono">
                          <span>Principal: <strong>${c.principal.toFixed(2)}</strong></span>
                          <span>(Trial Used: ${c.trialBonusUsed.toFixed(2)})</span>
                          <span>Lock Ends: {new Date(c.endDate).toISOString().split("T")[0]}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            Accumulated Yield
                          </span>
                          <span className="text-base font-black font-mono text-emerald-400">
                            +${c.accumulatedProfit.toFixed(2)}
                          </span>
                        </div>

                        {c.status === "ACTIVE" && isMatured ? (
                          <button
                            onClick={() => handleReleaseContract(c.id)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition"
                          >
                            Claim to Holding Wallet
                          </button>
                        ) : c.status === "ACTIVE" ? (
                          <span className="text-[11px] bg-slate-800 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3" /> LOCKED
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            RELEASED TO HOLDING
                          </span>
                        )}

                        <button
                          onClick={() => setExpandedContractId(isExpanded ? null : c.id)}
                          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED YIELD LOGS */}
                    {isExpanded && (
                      <div className="bg-slate-950/60 p-4 border-t border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Daily Yield Injections Log ({c.yieldLogs?.length || 0})
                        </h4>

                        {c.yieldLogs && c.yieldLogs.length > 0 ? (
                          <div className="space-y-2">
                            {c.yieldLogs.map((log: any) => (
                              <div
                                key={log.id}
                                className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 font-mono">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </span>
                                  <span className="text-sky-400 font-bold px-1.5 py-0.2 rounded bg-sky-500/10">
                                    +{log.yieldPercent}% Daily
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-emerald-400">
                                  +${log.profitAmount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic">
                            No daily yield logs posted yet. Check back when the Admin posts daily ROI updates!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ACTIVATION MODAL */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white mb-1">
              Activate {selectedTier.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Duration: {selectedTier.durationDays} Days | Min Deposit: ${selectedTier.minDeposit}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleActivateBot} className="space-y-4">
              {/* Trial Checkbox */}
              {!hasUsedTrial && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block">
                        Apply $100 Free Trial Credit
                      </span>
                      <span className="text-[10px] text-slate-300">
                        Reduces required top-up to $400 for $500 total principal
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useTrialCredit}
                    onChange={(e) => {
                      setUseTrialCredit(e.target.checked);
                      if (e.target.checked) setTopUpAmount("400");
                    }}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Holding Balance Display */}
              <div className="flex justify-between text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Holding Wallet Balance:</span>
                <strong className="text-white font-mono">${holdingBalance.toFixed(2)}</strong>
              </div>

              {/* TopUp Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Holding Wallet Top-up Amount ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  required
                />
              </div>

              {/* Total Principal Calculation */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Trial Credit Bonus:</span>
                  <span className="font-mono text-emerald-400">+${useTrialCredit ? 100 : 0}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>User Top-up:</span>
                  <span className="font-mono text-white">+${parseFloat(topUpAmount || "0").toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                  <span className="text-white">Total Bot Principal:</span>
                  <span className="font-mono text-amber-400">
                    ${(parseFloat(topUpAmount || "0") + (useTrialCredit ? 100 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTier(null)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {loading ? "Activating..." : "Confirm & Lock Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
