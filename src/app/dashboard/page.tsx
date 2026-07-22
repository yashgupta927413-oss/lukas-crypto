"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import WalletTransferModal from "@/components/wallet-transfer-modal";
import Footer from "@/components/footer";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  Bot,
  TrendingUp,
  ArrowRightLeft,
  Lock,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [wallets, setWallets] = useState({
    holdingBalance: 0,
    botBalance: 0,
    personalTradingBalance: 0,
  });

  const [contracts, setContracts] = useState<any[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [walletRes, botRes] = await Promise.all([
        fetch("/api/user/wallet"),
        fetch("/api/bots"),
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallets(walletData);
      }

      if (botRes.ok) {
        const botData = await botRes.json();
        setContracts(botData.contracts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DEPOSIT", amount }),
      });

      if (res.ok) {
        setActionMsg(`Successfully deposited $${amount.toFixed(2)} to Holding Wallet!`);
        setDepositAmount("");
        setShowDepositModal(false);
        fetchData();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "WITHDRAWAL", amount }),
      });

      if (res.ok) {
        setActionMsg(`Withdrawal request for $${amount.toFixed(2)} submitted for approval!`);
        setWithdrawAmount("");
        setShowWithdrawModal(false);
        fetchData();
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono">
        Loading platform dashboard...
      </div>
    );
  }

  const totalNetWorth =
    wallets.holdingBalance + wallets.botBalance + wallets.personalTradingBalance;
  const activeBots = contracts.filter((c) => c.status === "ACTIVE");
  const totalBotProfit = contracts.reduce((acc, c) => acc + c.accumulatedProfit, 0);

  const pieData = [
    { name: "Holding Wallet", value: wallets.holdingBalance, color: "#0ea5e9" },
    { name: "Bot Trading", value: wallets.botBalance, color: "#f59e0b" },
    { name: "Personal Options", value: wallets.personalTradingBalance, color: "#10b981" },
  ].filter((item) => item.value > 0);

  const defaultPieData = [
    { name: "Holding Wallet", value: 1, color: "#0ea5e9" },
    { name: "Bot Trading", value: 1, color: "#f59e0b" },
    { name: "Personal Options", value: 1, color: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                VERIFIED ACCOUNT
              </span>
              <span className="text-xs text-slate-400 font-mono">Role: {(session?.user as any)?.role}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Portfolio Control Center
            </h1>
            <p className="text-xs text-slate-400">
              Isolated 3-Wallet Model with Real-Time AI Yields & 1-Minute Binary Options
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Deposit Funds
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              <MinusCircle className="w-4 h-4" />
              Withdrawal
            </button>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Wallet Transfer
            </button>
          </div>
        </div>

        {actionMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* 3-WALLET ISOLATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Holding Wallet */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                  UNENCUMBERED
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                Holding Wallet
              </span>
              <h2 className="text-3xl font-black text-white font-mono mt-1">
                ${wallets.holdingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[11px] text-slate-400 mt-2">
                Primary deposit & withdrawal gateway. Free liquidity for transfers.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                Transfer Funds →
              </button>
            </div>
          </div>

          {/* 2. Bot Trading Wallet */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 uppercase tracking-wider">
                  <Lock className="w-3 h-3" /> CONTRACT LOCKED
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                Bot Trading Wallet
              </span>
              <h2 className="text-3xl font-black text-amber-400 font-mono mt-1">
                ${wallets.botBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[11px] text-slate-400 mt-2">
                Active AI Bot allocations. Unlocked only upon contract maturity.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Active Bots: <strong className="text-white">{activeBots.length}</strong>
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                +${totalBotProfit.toFixed(2)} Total Yield
              </span>
            </div>
          </div>

          {/* 3. Personal Trading Wallet */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  1M/5M OPTIONS READY
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                Personal Trading Wallet
              </span>
              <h2 className="text-3xl font-black text-emerald-400 font-mono mt-1">
                ${wallets.personalTradingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[11px] text-slate-400 mt-2">
                Dedicated exclusively for Binary Options trading stakes.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => router.push("/options")}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Trade Options →
              </button>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ASSET ALLOCATION PIE CHART & STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-sky-400" />
                  Portfolio Asset Allocation
                </h3>
                <p className="text-xs text-slate-400">Visual distribution of your capital across the 3 wallets</p>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ${totalNetWorth.toFixed(2)} NET WORTH
              </span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : defaultPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(pieData.length > 0 ? pieData : defaultPieData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-mono">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Holding</span>
                <span className="font-bold text-sky-400">${wallets.holdingBalance.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Bot Trading</span>
                <span className="font-bold text-amber-400">${wallets.botBalance.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Options</span>
                <span className="font-bold text-emerald-400">${wallets.personalTradingBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* AI BOT DAILY PROFIT BREAKDOWN CARD */}
            <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 space-y-3 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">AI Bot Daily Profit Rates</h3>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  UPDATED DAILY VIA ADMIN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-sans">1 Month Growth</span>
                  <strong className="text-emerald-400 block">~0.50% / Day</strong>
                  <span className="text-[9px] text-slate-500 block font-sans">Min $500</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-sans">3 Month Maximizer</span>
                  <strong className="text-emerald-400 block">~0.61% / Day</strong>
                  <span className="text-[9px] text-slate-500 block font-sans">Min $500</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-sans">6 Month Pro</span>
                  <strong className="text-emerald-400 block">~0.72% / Day</strong>
                  <span className="text-[9px] text-slate-500 block font-sans">Min $1,000</span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-sans">1 Year Elite</span>
                  <strong className="text-emerald-400 block">~0.88% / Day</strong>
                  <span className="text-[9px] text-slate-500 block font-sans">Min $2,500</span>
                </div>
              </div>

              <button
                onClick={() => router.push("/bots")}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Activate AI Bot Plan</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => router.push("/options")}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group relative overflow-hidden flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                    1m & 5m Binary Options
                  </h3>
                  <p className="text-xs text-slate-400">
                    Binance WebSocket feeds & 80% payouts
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* ACTIVE BOT CONTRACTS SUMMARY */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              Active Bot Contracts
            </h3>
            <button
              onClick={() => router.push("/bots")}
              className="text-xs text-sky-400 hover:underline font-semibold"
            >
              View All Bot Plans →
            </button>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800/60">
              No active bot contracts found. Claim your $100 Trial + $400 Top-up to start earning daily yields!
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{c.tierName}</span>
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
                    <div className="text-xs text-slate-400 font-mono">
                      Principal: <strong className="text-slate-200">${c.principal.toFixed(2)}</strong> (Trial: ${c.trialBonusUsed.toFixed(2)})
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Accumulated Profit
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        +${c.accumulatedProfit.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Lock End Date
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        {new Date(c.endDate).toISOString().split("T")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Wallet Transfer Modal */}
      <WalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        onSuccess={fetchData}
      />

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-black text-white">KYC-Free Crypto Deposit</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  100% NON-CUSTODIAL / NO KYC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deposit crypto from any private non-custodial wallet (Metamask, Trust Wallet, Ledger, Exodus, Telegram Wallet) directly into your Holding Wallet.
              </p>
            </div>

            {/* Network Selector */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-2xl border border-sky-500/30 text-center">
                <span className="block font-bold text-white text-xs">USDT (TRC-20)</span>
                <span className="text-[9px] text-sky-400">TRON Network</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                <span className="block font-bold text-white text-xs">USDT (BEP-20)</span>
                <span className="text-[9px] text-amber-400">BNB Smart Chain</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                <span className="block font-bold text-white text-xs">BTC (Native)</span>
                <span className="text-[9px] text-emerald-400">Bitcoin Network</span>
              </div>
            </div>

            {/* Non-Custodial Deposit Address Box */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Official Non-Custodial Deposit Address:</span>
                <span className="text-emerald-400 font-bold">0% Processing Fee</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sky-400 text-[11px] break-all flex items-center justify-between gap-2">
                <span>TY9a1x7Z8bQxLp2mK9vR5wE4tY8uI0oP</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText("TY9a1x7Z8bQxLp2mK9vR5wE4tY8uI0oP")}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] shrink-0 font-sans font-bold"
                >
                  Copy Address
                </button>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Deposit Amount ($ USD Equivalent)
                </label>
                <input
                  type="number"
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="500.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-sky-500 font-bold"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
                >
                  Confirm KYC-Free Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-black text-white">KYC-Free Withdrawal Request</h3>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 font-mono">
                  DIRECT NON-CUSTODIAL PAYOUT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Withdraw unencumbered Holding Wallet funds directly to any private crypto address without identity verification.
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Destination Wallet Network / Token
                </label>
                <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono">
                  <option value="TRC20">USDT - TRON Network (TRC-20)</option>
                  <option value="BEP20">USDT / USDC - BNB Smart Chain (BEP-20)</option>
                  <option value="BTC">Bitcoin (BTC Native Address)</option>
                  <option value="ERC20">USDT / USDC - Ethereum (ERC-20)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Destination Crypto Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. TY9a1x7Z... or 0x71C7..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="text-slate-300 font-semibold">Withdrawal Amount ($ USD)</label>
                  <span className="text-slate-400 font-mono">Available: ${wallets.holdingBalance.toFixed(2)}</span>
                </div>
                <input
                  type="number"
                  step="any"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-sky-500 font-bold"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-sky-500/20 uppercase tracking-wider"
                >
                  Submit Payout Request
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
