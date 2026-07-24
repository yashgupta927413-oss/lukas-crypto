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
      setError("Please enter a valid amount");
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

      if (res.ok) {
        setSuccessMsg(`🚀 Vault ${selectedTier.name} activated!`);
        setSelectedTier(null);
        fetchData();
      } else {
        setError(data.error || "Failed to activate vault");
      }
    } catch (err: any) {
      setError(err.message || "Error processing vault activation");
    } finally {
      setLoading(false);
    }
  };

  const hasUsedTrial = contracts.some((c) => c.trialBonusUsed > 0);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="bg-[#12161f] p-6 rounded-lg border border-[#263044]">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Quantitative Yield Vaults
            </h1>
            <p className="text-xs text-[#848e9c] max-w-2xl">
              Lock assets into structured yield strategies for 30 to 365 days. Daily earnings accrue automatically into your Vault account.
            </p>
          </div>
        </div>

        {/* Welcome Bonus Banner */}
        <div className="bg-[#12161f] p-5 rounded-lg border border-[#263044] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#f0b90b]/10 text-[#f0b90b] font-bold text-base flex items-center justify-center border border-[#f0b90b]/30">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  ${globalConfig.trialCreditAmount || 100} Welcome Trial Credit
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    hasUsedTrial
                      ? "bg-[#181e2a] text-[#848e9c] border border-[#263044]"
                      : "bg-[#0ecb81] text-[#0b0e11]"
                  }`}
                >
                  {hasUsedTrial ? "REDEEMED" : "AVAILABLE NOW"}
                </span>
              </div>
              <p className="text-[11px] text-[#848e9c] mt-0.5 font-sans">
                {hasUsedTrial
                  ? "Your $100 trial credit has been allocated to an active/completed vault."
                  : "Apply your $100 Welcome Credit with a $400 top-up to activate the $500 minimum vault."}
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 rounded bg-[#0ecb81]/10 border border-[#0ecb81]/30 text-[#0ecb81] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Interactive Yield Estimator Calculator */}
        <div className="bg-[#12161f] border border-[#263044] rounded-lg p-5 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#263044]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Yield Estimator Calculator</h3>
            <span className="text-[#0ecb81] font-bold">Compounding Projections</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Input 1: Principal Amount */}
            <div className="space-y-1.5">
              <label className="text-[#848e9c] font-sans block">Investment Principal (USDT)</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Math.max(100, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#0b0e11] border border-[#263044] rounded px-3 py-2 text-sm font-bold text-white outline-none focus:border-[#f0b90b]"
              />
            </div>

            {/* Input 2: Lock Term */}
            <div className="space-y-1.5">
              <label className="text-[#848e9c] font-sans block">Lock Duration</label>
              <div className="grid grid-cols-4 gap-1">
                {[30, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    onClick={() => setCalcDays(d)}
                    className={`py-2 rounded font-bold text-xs transition-colors ${
                      calcDays === d ? "bg-[#f0b90b] text-[#0b0e11]" : "bg-[#0b0e11] text-[#848e9c] hover:text-white border border-[#263044]"
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Output: Estimated Earnings */}
            <div className="bg-[#0b0e11] p-3 rounded border border-[#263044] space-y-1">
              <div className="flex justify-between text-[#848e9c] text-[11px]">
                <span>Projected ROI ({calcDays === 30 ? "15%" : calcDays === 90 ? "45%" : calcDays === 180 ? "95%" : "220%"}):</span>
                <span className="text-[#0ecb81] font-bold">+${(calcAmount * (calcDays === 30 ? 0.15 : calcDays === 90 ? 0.45 : calcDays === 180 ? 0.95 : 2.2)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white text-sm font-bold pt-1 border-t border-[#263044]">
                <span>Total Maturity Payout:</span>
                <span className="text-[#f0b90b]">${(calcAmount * (1 + (calcDays === 30 ? 0.15 : calcDays === 90 ? 0.45 : calcDays === 180 ? 0.95 : 2.2))).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VAULT TIERS GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f0b90b]" />
              Structured Earn Strategies
            </h2>
            <span className="text-xs text-[#848e9c] font-mono">Available: {tiers.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-[#12161f] p-5 rounded-lg border border-[#263044] hover:border-[#323e57] flex flex-col justify-between transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#181e2a] text-[#38bdf8] border border-[#263044] font-bold">
                      {tier.durationDays} DAYS TERM
                    </span>
                    <span className="text-xs font-bold text-[#0ecb81] font-mono">
                      +{tier.minRoiPercent}% EST. ROI
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{tier.name}</h3>

                  <div className="py-2 border-y border-[#263044] space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#848e9c]">
                      <span>Minimum Principal:</span>
                      <span className="text-white font-bold">${tier.minDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#848e9c]">
                      <span>Daily Yield Accrual:</span>
                      <span className="text-[#0ecb81] font-bold">Automatic</span>
                    </div>
                    <div className="flex justify-between text-[#848e9c]">
                      <span>Term Maturity:</span>
                      <span className="text-slate-300 font-bold">{tier.durationDays} Days</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTier(tier);
                    setError(null);
                  }}
                  className="w-full mt-4 py-2 bg-[#263044] hover:bg-[#323e57] text-[#f0b90b] font-bold rounded text-xs transition-colors"
                >
                  Allocate Principal →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE VAULT CONTRACTS TABLE */}
        <div className="bg-[#12161f] border border-[#263044] rounded-lg p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f0b90b]" />
              Active Vault Allocations ({contracts.length})
            </h3>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-8 text-[#848e9c] text-xs bg-[#0b0e11] rounded border border-[#263044]">
              No active vault allocations. Select a strategy tier above to begin earning daily yield.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b0e11] text-[#848e9c] uppercase text-[10px] border-b border-[#263044]">
                  <tr>
                    <th className="p-2.5">Vault Tier</th>
                    <th className="p-2.5">Principal</th>
                    <th className="p-2.5">Yield Earned</th>
                    <th className="p-2.5">Maturity Date</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263044]/50 text-slate-200">
                  {contracts.map((c) => {
                    const isCompleted = c.status === "COMPLETED";
                    const isExpanded = expandedContractId === c.id;

                    return (
                      <React.Fragment key={c.id}>
                        <tr
                          onClick={() => setExpandedContractId(isExpanded ? null : c.id)}
                          className="hover:bg-[#181e2a] cursor-pointer transition-colors"
                        >
                          <td className="p-2.5 font-bold text-white flex items-center gap-2">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-[#848e9c]" />}
                            <span>{c.tierName}</span>
                          </td>
                          <td className="p-2.5 font-bold">${Number(c.totalDeposit).toFixed(2)}</td>
                          <td className="p-2.5 text-[#0ecb81] font-bold">+${Number(c.accumulatedProfit).toFixed(2)}</td>
                          <td className="p-2.5 text-[#848e9c]">{new Date(c.endDate).toLocaleDateString()}</td>
                          <td className="p-2.5">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                isCompleted
                                  ? "bg-[#0ecb81]/10 text-[#0ecb81]"
                                  : "bg-[#f0b90b]/10 text-[#f0b90b]"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#0b0e11]">
                            <td colSpan={5} className="p-4 space-y-2">
                              <div className="text-xs font-bold text-white mb-2">Daily Yield Log:</div>
                              {c.logs && c.logs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {c.logs.map((log: any) => (
                                    <div key={log.id} className="p-2 bg-[#12161f] rounded border border-[#263044] flex justify-between text-[11px]">
                                      <span className="text-[#848e9c]">{new Date(log.createdAt).toLocaleDateString()}</span>
                                      <span className="text-[#0ecb81] font-bold">+${Number(log.profitAmount).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[#848e9c] text-xs">First daily yield log pending...</div>
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
          <div className="fixed inset-0 z-50 bg-[#0b0e11]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12161f] border border-[#263044] rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center pb-2 border-b border-[#263044]">
                <h3 className="text-base font-bold text-white">Allocate to {selectedTier.name}</h3>
                <button
                  onClick={() => setSelectedTier(null)}
                  className="text-[#848e9c] hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleActivateBot} className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-[#0b0e11] rounded border border-[#263044] space-y-1.5">
                  <div className="flex justify-between text-[#848e9c]">
                    <span>Required Principal:</span>
                    <span className="text-white font-bold">${selectedTier.minDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#848e9c]">
                    <span>Holding Balance:</span>
                    <span className="text-[#0ecb81] font-bold">${holdingBalance.toFixed(2)}</span>
                  </div>
                </div>

                {!hasUsedTrial && (
                  <div className="flex items-center gap-2 p-2.5 bg-[#0ecb81]/10 rounded border border-[#0ecb81]/30">
                    <input
                      type="checkbox"
                      id="trialCredit"
                      checked={useTrialCredit}
                      onChange={(e) => setUseTrialCredit(e.target.checked)}
                      className="rounded accent-[#0ecb81]"
                    />
                    <label htmlFor="trialCredit" className="text-slate-200 cursor-pointer font-sans">
                      Apply $100 Welcome Credit (Requires $400 top-up)
                    </label>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[#848e9c] font-sans block">Top-up Amount from Holding Account ($)</label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="400.00"
                    className="w-full bg-[#0b0e11] border border-[#263044] rounded px-3 py-2 text-sm text-white font-bold outline-none focus:border-[#f0b90b]"
                  />
                </div>

                {error && (
                  <div className="p-2.5 bg-[#f6465d]/10 border border-[#f6465d]/30 text-[#f6465d] rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTier(null)}
                    className="w-1/2 py-2.5 bg-[#181e2a] hover:bg-[#263044] text-white font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-2.5 bg-[#f0b90b] hover:bg-[#d97706] text-[#0b0e11] font-bold rounded"
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
