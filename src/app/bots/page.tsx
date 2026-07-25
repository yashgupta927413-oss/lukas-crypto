"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Vault,
  Gift,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Layers,
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
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcDays, setCalcDays] = useState<number>(90);

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

    if (!selectedTier) return;

    setLoading(true);
    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: selectedTier.id,
          topUpAmount: topUp,
          useTrialCredit,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`🎉 Successfully activated ${selectedTier.name} Strategy Vault!`);
        setSelectedTier(null);
        fetchData();
      } else {
        setError(data.error || "Failed to activate bot contract");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const hasUsedTrial = contracts.some((c) => Number(c.trialBonusUsed) > 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Welcome Bonus Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Quantitative Yield Vaults
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                Lock digital assets in structured quantitative strategies. Daily yield accrues automatically and auto-releases upon maturity to your Holding Wallet.
              </p>
            </div>
          </div>

          {/* Trial Credit Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 font-black shadow-xs">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  ${globalConfig.trialCreditAmount || 100} Welcome Trial Credit
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    hasUsedTrial
                      ? "bg-slate-200 text-slate-600"
                      : "bg-emerald-600 text-white shadow-xs"
                  }`}
                >
                  {hasUsedTrial ? "REDEEMED" : "AVAILABLE NOW"}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-sans">
                {hasUsedTrial
                  ? "Your $100 trial credit has been allocated to an active/completed vault."
                  : "Apply your $100 Welcome Credit with a $400 top-up to activate the $500 minimum vault."}
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Interactive Yield Estimator Calculator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 font-mono text-xs shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">Yield Estimator Calculator</h3>
            <span className="text-emerald-600 font-bold">Compounding Projections</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Input 1: Principal Amount */}
            <div className="space-y-1.5 font-sans">
              <label className="text-slate-500 font-bold block">Investment Principal (USDT)</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Math.max(100, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Input 2: Lock Term */}
            <div className="space-y-1.5 font-sans">
              <label className="text-slate-500 font-bold block">Lock Duration</label>
              <div className="grid grid-cols-4 gap-1.5 font-mono">
                {[30, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    onClick={() => setCalcDays(d)}
                    className={`py-2 rounded-lg font-bold text-xs transition-colors ${
                      calcDays === d ? "bg-blue-600 text-white shadow-xs" : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Output: Estimated Earnings */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Projected ROI ({calcDays === 30 ? "15%" : calcDays === 90 ? "45%" : calcDays === 180 ? "95%" : "220%"}):</span>
                <span className="text-emerald-600 font-bold">+${(calcAmount * (calcDays === 30 ? 0.15 : calcDays === 90 ? 0.45 : calcDays === 180 ? 0.95 : 2.2)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-bold pt-1.5 border-t border-slate-200">
                <span>Total Maturity Payout:</span>
                <span className="text-blue-600 font-black">${(calcAmount * (1 + (calcDays === 30 ? 0.15 : calcDays === 90 ? 0.45 : calcDays === 180 ? 0.95 : 2.2))).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VAULT TIERS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Structured Earn Strategies
            </h2>
            <span className="text-xs text-slate-500 font-mono">Available: {tiers.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 flex flex-col justify-between transition-all shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {tier.durationDays} DAYS TERM
                    </span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      +{tier.minRoiPercent}% EST. ROI
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>

                  <div className="py-3 border-y border-slate-100 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Minimum Principal:</span>
                      <span className="text-slate-900 font-bold">${tier.minDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Daily Yield Accrual:</span>
                      <span className="text-emerald-600 font-bold">Automatic</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Term Maturity:</span>
                      <span className="text-slate-700 font-bold">{tier.durationDays} Days</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTier(tier);
                    setError(null);
                  }}
                  className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Allocate Principal →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE VAULT CONTRACTS TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Active Vault Allocations ({contracts.length})
            </h3>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              No active vault allocations. Select a strategy tier above to begin earning daily yield.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3">Vault Tier</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Yield Earned</th>
                    <th className="p-3">Maturity Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {contracts.map((c) => {
                    const isCompleted = c.status === "COMPLETED";
                    const isExpanded = expandedContractId === c.id;

                    return (
                      <React.Fragment key={c.id}>
                        <tr
                          onClick={() => setExpandedContractId(isExpanded ? null : c.id)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            <span>{c.tierName}</span>
                          </td>
                          <td className="p-3 font-bold">${Number(c.totalDeposit || c.principal).toFixed(2)}</td>
                          <td className="p-3 text-emerald-600 font-bold">+${Number(c.accumulatedProfit).toFixed(2)}</td>
                          <td className="p-3 text-slate-500">{new Date(c.endDate).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span
                              className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50">
                            <td colSpan={5} className="p-4 space-y-2">
                              <div className="text-xs font-bold text-slate-900 mb-2 font-sans">Daily Yield Log:</div>
                              {c.logs && c.logs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {c.logs.map((log: any) => (
                                    <div key={log.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between text-[11px]">
                                      <span className="text-slate-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                                      <span className="text-emerald-600 font-bold">+${Number(log.profitAmount).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-slate-400 text-xs font-sans">First daily yield log pending...</div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vault Activation Modal */}
        {selectedTier && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Allocate to {selectedTier.name}</h3>
                <button
                  onClick={() => setSelectedTier(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleActivateBot} className="space-y-4 font-mono text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Required Principal:</span>
                    <span className="text-slate-900 font-bold">${selectedTier.minDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Holding Balance:</span>
                    <span className="text-emerald-600 font-bold">${holdingBalance.toFixed(2)}</span>
                  </div>
                </div>

                {!hasUsedTrial && (
                  <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      id="trialCredit"
                      checked={useTrialCredit}
                      onChange={(e) => setUseTrialCredit(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="trialCredit" className="text-emerald-800 cursor-pointer font-sans font-bold text-xs">
                      Apply $100 Welcome Credit (Requires $400 top-up)
                    </label>
                  </div>
                )}

                <div className="space-y-1 font-sans">
                  <label className="text-slate-500 font-bold block">Top-up Amount from Holding Account ($)</label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="400.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 font-bold outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-sans text-xs">
                    {error}
                  </div>
                )}

                <div className="flex gap-2.5 pt-2 font-sans">
                  <button
                    type="button"
                    onClick={() => setSelectedTier(null)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    {loading ? "Activating..." : "Confirm Allocation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
