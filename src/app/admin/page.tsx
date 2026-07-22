"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import {
  ShieldAlert,
  Sliders,
  Layers,
  Percent,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  Trash2,
  DollarSign,
  Search,
  Check,
  X,
  Mail,
  Send,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "CONFIG" | "TIERS" | "YIELD" | "USERS" | "AUDIT" | "QUEUE" | "SMTP"
  >("CONFIG");

  const [adminData, setAdminData] = useState<any>({
    config: {},
    tiers: [],
    users: [],
    optionTrades: [],
    pendingTransactions: [],
  });

  // Config Form State
  const [configForm, setConfigForm] = useState({
    trialCreditAmount: 100,
    minBotDeposit: 500,
    maxBotDeposit: 10000,
    binaryOptionWinRate: 75,
    referralBonusPercent: 5,
  });

  // Tier Form State
  const [newTier, setNewTier] = useState({
    name: "",
    durationDays: 30,
    minRoiPercent: 15,
    minDeposit: 500,
    maxDeposit: 10000,
  });

  // Yield Injector State
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [yieldPercent, setYieldPercent] = useState<string>("2.5");

  // User Search & Balance Adjustment State
  const [userSearch, setUserSearch] = useState("");
  const [adjustingUser, setAdjustingUser] = useState<any | null>(null);
  const [selectedWalletType, setSelectedWalletType] = useState<"HOLDING" | "BOT" | "PERSONAL">(
    "HOLDING"
  );
  const [newWalletBalance, setNewWalletBalance] = useState<string>("");

  // SMTP Config State
  const [smtpForm, setSmtpForm] = useState({
    smtpHost: "smtp.mail.me.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    smtpFromEmail: "",
    smtpFromName: "Lukas Crypto Management",
    smtpEnabled: false,
  });
  const [testEmailAddr, setTestEmailAddr] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && (session.user as any)?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
        if (data.config) {
          setConfigForm({
            trialCreditAmount: data.config.trialCreditAmount,
            minBotDeposit: data.config.minBotDeposit,
            maxBotDeposit: data.config.maxBotDeposit,
            binaryOptionWinRate: data.config.binaryOptionWinRate,
            referralBonusPercent: data.config.referralBonusPercent,
          });
          setSmtpForm({
            smtpHost: data.config.smtpHost || "smtp.mail.me.com",
            smtpPort: data.config.smtpPort || 587,
            smtpUser: data.config.smtpUser || "",
            smtpPass: data.config.smtpPass || "",
            smtpFromEmail: data.config.smtpFromEmail || "",
            smtpFromName: data.config.smtpFromName || "Lukas Crypto Management",
            smtpEnabled: data.config.smtpEnabled || false,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session && (session.user as any)?.role === "ADMIN") {
      fetchAdminData();
    }
  }, [session]);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_CONFIG",
          data: configForm,
        }),
      });

      if (!res.ok) throw new Error("Config update failed");
      setMsg({ type: "success", text: "Global System Configuration updated & persisted!" });
      fetchAdminData();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_TIER",
          data: newTier,
        }),
      });

      if (!res.ok) throw new Error("Tier creation failed");
      setMsg({ type: "success", text: `New Bot Tier "${newTier.name}" created successfully!` });
      setNewTier({
        name: "",
        durationDays: 30,
        minRoiPercent: 15,
        minDeposit: 500,
        maxDeposit: 10000,
      });
      fetchAdminData();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInjectYield = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTierId) {
      setMsg({ type: "error", text: "Please select a Bot Tier" });
      return;
    }

    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "INJECT_YIELD",
          tierId: selectedTierId,
          yieldPercent: parseFloat(yieldPercent),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yield injection failed");

      setMsg({
        type: "success",
        text: `Daily yield of +${yieldPercent}% executed for ${data.affectedContracts} active contracts! Total profit distributed: $${data.totalProfitDistributed.toFixed(2)}`,
      });
      fetchAdminData();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;

    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADJUST_WALLET",
          userId: adjustingUser.id,
          walletType: selectedWalletType,
          newBalance: parseFloat(newWalletBalance),
        }),
      });

      if (!res.ok) throw new Error("Balance adjustment failed");

      setMsg({ type: "success", text: `User ${adjustingUser.email} ${selectedWalletType} balance updated to $${parseFloat(newWalletBalance).toFixed(2)}` });
      setAdjustingUser(null);
      fetchAdminData();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessTransaction = async (transactionId: string, decision: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PROCESS_TRANSACTION",
          transactionId,
          decision,
        }),
      });

      if (!res.ok) throw new Error("Transaction processing failed");
      setMsg({ type: "success", text: `Transaction ${decision.toLowerCase()}d successfully!` });
      fetchAdminData();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    }
  };

  const handleUpdateSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_SMTP", data: smtpForm }),
      });
      if (!res.ok) throw new Error("SMTP config update failed");
      setMsg({ type: "success", text: "SMTP configuration saved successfully!" });
      fetchAdminData();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddr) {
      setMsg({ type: "error", text: "Enter a test email address" });
      return;
    }
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_TEST_EMAIL", email: testEmailAddr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test email failed");
      setMsg({ type: "success", text: `Test email sent to ${testEmailAddr}!` });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = adminData.users.filter((u: any) =>
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-rose-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Dynamic Control Panel</h1>
              <p className="text-xs text-slate-400">
                Full operational power: System parameters, Daily Yield Injection, Wallet overrides & Audits.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
            ROLE_ADMIN
          </span>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in ${
              msg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* ADMIN MODULE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {[
            { id: "CONFIG", name: "System Config", icon: Sliders },
            { id: "TIERS", name: "Bot Tiers", icon: Layers },
            { id: "YIELD", name: "Daily Yield Injector", icon: Percent },
            { id: "USERS", name: "User Wallets", icon: Users },
            { id: "AUDIT", name: "Options Audit", icon: Clock },
            { id: "QUEUE", name: "Payout Queue", icon: DollarSign },
            { id: "SMTP", name: "Email / SMTP", icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* MODULE 1: GLOBAL SYSTEM CONFIG */}
        {activeTab === "CONFIG" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white">Global Operational Parameters</h2>
            <form onSubmit={handleUpdateConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Free Trial Credit Amount ($)
                </label>
                <input
                  type="number"
                  value={configForm.trialCreditAmount}
                  onChange={(e) => setConfigForm({ ...configForm, trialCreditAmount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Minimum Bot Deposit Threshold ($)
                </label>
                <input
                  type="number"
                  value={configForm.minBotDeposit}
                  onChange={(e) => setConfigForm({ ...configForm, minBotDeposit: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Binary Options Win Payout Rate (%)
                </label>
                <input
                  type="number"
                  value={configForm.binaryOptionWinRate}
                  onChange={(e) => setConfigForm({ ...configForm, binaryOptionWinRate: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Referral Bonus Commission (%)
                </label>
                <input
                  type="number"
                  value={configForm.referralBonusPercent}
                  onChange={(e) => setConfigForm({ ...configForm, referralBonusPercent: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  Save & Persist Configuration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODULE 2: BOT TIERS MANAGER */}
        {activeTab === "TIERS" && (
          <div className="space-y-6">
            {/* Create Tier Form */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                Create New Bot Tier
              </h2>
              <form onSubmit={handleCreateTier} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Plan Name (e.g. 2 Month Plan)"
                  value={newTier.name}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Duration Days (e.g. 60)"
                  value={newTier.durationDays}
                  onChange={(e) => setNewTier({ ...newTier, durationDays: parseInt(e.target.value) })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Min ROI % (e.g. 35)"
                  value={newTier.minRoiPercent}
                  onChange={(e) => setNewTier({ ...newTier, minRoiPercent: parseFloat(e.target.value) })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Min Deposit $"
                  value={newTier.minDeposit}
                  onChange={(e) => setNewTier({ ...newTier, minDeposit: parseFloat(e.target.value) })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Deposit $"
                  value={newTier.maxDeposit}
                  onChange={(e) => setNewTier({ ...newTier, maxDeposit: parseFloat(e.target.value) })}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Add Bot Tier
                </button>
              </form>
            </div>

            {/* Tiers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminData.tiers.map((t: any) => (
                <div key={t.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{t.name}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-1 space-x-3">
                      <span>{t.durationDays} Days</span>
                      <span>ROI: +{t.minRoiPercent}%</span>
                      <span>Min: ${t.minDeposit}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 3: MANUAL DAILY YIELD INJECTOR */}
        {activeTab === "YIELD" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                Manual Daily Yield Injector Engine
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Post daily ROI percentage. Automatically calculates `activePrincipal * yieldPercent` for all active user contracts in selected tier.
              </p>
            </div>

            <form onSubmit={handleInjectYield} className="max-w-md space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Target Bot Tier
                </label>
                <select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  required
                >
                  <option value="">-- Choose Tier --</option>
                  {adminData.tiers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.durationDays} Days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Daily Yield Percentage (% e.g., 2.5 for +2.5%)
                </label>
                <input
                  type="number"
                  step="any"
                  value={yieldPercent}
                  onChange={(e) => setYieldPercent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
              >
                {loading ? "Injecting Yield..." : "Execute Profit Injection"}
              </button>
            </form>
          </div>
        )}

        {/* MODULE 4: USER MANAGEMENT & WALLET CONTROL */}
        {activeTab === "USERS" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                Registered Users & 3-Wallet Balances
              </h2>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3 px-3">User Email</th>
                    <th className="pb-3 px-3">Role</th>
                    <th className="pb-3 px-3">Holding Wallet</th>
                    <th className="pb-3 px-3">Bot Wallet</th>
                    <th className="pb-3 px-3">Personal Wallet</th>
                    <th className="pb-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id}>
                      <td className="py-3 px-3 font-bold text-white">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === "ADMIN" ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-300"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-200">${u.wallets.holdingBalance.toFixed(2)}</td>
                      <td className="py-3 px-3 text-amber-400">${u.wallets.botBalance.toFixed(2)}</td>
                      <td className="py-3 px-3 text-emerald-400">${u.wallets.personalTradingBalance.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setAdjustingUser(u);
                            setNewWalletBalance(u.wallets.holdingBalance.toString());
                          }}
                          className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 rounded-lg text-[10px] font-bold"
                        >
                          Edit Balance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 5: BINARY OPTION AUDIT */}
        {activeTab === "AUDIT" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Platform Binary Options Trade Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="pb-3 px-3">User</th>
                    <th className="pb-3 px-3">Asset</th>
                    <th className="pb-3 px-3">Direction</th>
                    <th className="pb-3 px-3">Stake</th>
                    <th className="pb-3 px-3">Strike</th>
                    <th className="pb-3 px-3">Settlement</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {adminData.optionTrades.map((t: any) => (
                    <tr key={t.id}>
                      <td className="py-3 px-3 text-slate-300 font-sans">{t.userEmail}</td>
                      <td className="py-3 px-3 font-bold text-white">{t.symbol}</td>
                      <td className="py-3 px-3 font-bold">{t.direction}</td>
                      <td className="py-3 px-3">${t.stakeAmount.toFixed(2)}</td>
                      <td className="py-3 px-3">${t.strikePrice}</td>
                      <td className="py-3 px-3">{t.settlementPrice || "---"}</td>
                      <td className="py-3 px-3 font-bold">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 6: DEPOSIT & PAYOUT QUEUE */}
        {activeTab === "QUEUE" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Deposit & Withdrawal Approval Queue</h2>

            {adminData.pendingTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
                No pending payout or deposit requests.
              </div>
            ) : (
              <div className="space-y-3">
                {adminData.pendingTransactions.map((tx: any) => (
                  <div key={tx.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{tx.userEmail}</span>
                      <span className="text-slate-400 font-mono">
                        Type: {tx.type} | Amount: ${tx.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcessTransaction(tx.id, "APPROVE")}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleProcessTransaction(tx.id, "REJECT")}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* ADJUST BALANCE MODAL */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Override Balance for {adjustingUser.email}
            </h3>

            <form onSubmit={handleAdjustBalance} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Wallet
                </label>
                <select
                  value={selectedWalletType}
                  onChange={(e) => setSelectedWalletType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                >
                  <option value="HOLDING">Holding Wallet</option>
                  <option value="BOT">Bot Trading Wallet</option>
                  <option value="PERSONAL">Personal Trading Wallet</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  New Balance Amount ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newWalletBalance}
                  onChange={(e) => setNewWalletBalance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  Apply Balance Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* MODULE 7: SMTP / EMAIL CONFIG */}
        {activeTab === "SMTP" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-sky-400" />
                iCloud SMTP Email Configuration
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${smtpForm.smtpEnabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                {smtpForm.smtpEnabled ? "● ENABLED" : "○ DISABLED"}
              </span>
            </div>

            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-xs text-sky-300">
              <strong>iCloud Setup:</strong> Go to <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noopener" className="underline font-bold">appleid.apple.com</a> → Sign-In & Security → App-Specific Passwords → Generate one named &quot;Lukas Crypto&quot;.
            </div>

            <form onSubmit={handleUpdateSmtp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">SMTP Host</label>
                  <input type="text" value={smtpForm.smtpHost} onChange={(e) => setSmtpForm({ ...smtpForm, smtpHost: e.target.value })} placeholder="smtp.mail.me.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">SMTP Port</label>
                  <input type="number" value={smtpForm.smtpPort} onChange={(e) => setSmtpForm({ ...smtpForm, smtpPort: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">iCloud Email (Login)</label>
                  <input type="email" value={smtpForm.smtpUser} onChange={(e) => setSmtpForm({ ...smtpForm, smtpUser: e.target.value })} placeholder="you@icloud.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">App-Specific Password</label>
                  <input type="password" value={smtpForm.smtpPass} onChange={(e) => setSmtpForm({ ...smtpForm, smtpPass: e.target.value })} placeholder="xxxx-xxxx-xxxx-xxxx" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sender Email (From)</label>
                  <input type="email" value={smtpForm.smtpFromEmail} onChange={(e) => setSmtpForm({ ...smtpForm, smtpFromEmail: e.target.value })} placeholder="noreply@icloud.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sender Display Name</label>
                  <input type="text" value={smtpForm.smtpFromName} onChange={(e) => setSmtpForm({ ...smtpForm, smtpFromName: e.target.value })} placeholder="Lukas Crypto Management" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <button type="button" onClick={() => setSmtpForm({ ...smtpForm, smtpEnabled: !smtpForm.smtpEnabled })} className={`w-12 h-6 rounded-full transition-all relative ${smtpForm.smtpEnabled ? "bg-emerald-500" : "bg-slate-700"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${smtpForm.smtpEnabled ? "left-6" : "left-0.5"}`}></span>
                </button>
                <span className="text-xs font-bold text-slate-300">Enable email notifications (Welcome, Deposit, Withdrawal, Bot Activation)</span>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50">
                {loading ? "Saving..." : "Save SMTP Configuration"}
              </button>
            </form>

            {/* Test Email */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                Send Test Email
              </h3>
              <div className="flex gap-2">
                <input type="email" value={testEmailAddr} onChange={(e) => setTestEmailAddr(e.target.value)} placeholder="test@example.com" className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500" />
                <button onClick={handleSendTestEmail} disabled={loading} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Test
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
