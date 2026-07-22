"use client";

import { useState } from "react";
import { ArrowRightLeft, X, CheckCircle2, AlertCircle } from "lucide-react";

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: {
    holdingBalance: number;
    botBalance: number;
    personalTradingBalance: number;
  };
  onSuccess: () => void;
}

export default function WalletTransferModal({
  isOpen,
  onClose,
  wallets,
  onSuccess,
}: WalletTransferModalProps) {
  const [direction, setDirection] = useState<"HOLDING_TO_PERSONAL" | "PERSONAL_TO_HOLDING">(
    "HOLDING_TO_PERSONAL"
  );
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const availableMax =
    direction === "HOLDING_TO_PERSONAL"
      ? wallets.holdingBalance
      : wallets.personalTradingBalance;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than $0");
      return;
    }

    if (numAmount > availableMax) {
      setError(`Amount exceeds available balance of $${availableMax.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRANSFER",
          amount: numAmount,
          direction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Transfer failed");
      }

      setSuccessMsg("Wallet transfer completed successfully!");
      setAmount("");
      onSuccess();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to transfer funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Wallet Transfer</h3>
            <p className="text-xs text-slate-400">Move funds between your Holding & Trading wallets</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          {/* Direction Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Transfer Direction
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDirection("HOLDING_TO_PERSONAL")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                  direction === "HOLDING_TO_PERSONAL"
                    ? "bg-sky-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Holding → Personal
              </button>
              <button
                type="button"
                onClick={() => setDirection("PERSONAL_TO_HOLDING")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                  direction === "PERSONAL_TO_HOLDING"
                    ? "bg-sky-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Personal → Holding
              </button>
            </div>
          </div>

          {/* Source / Target Wallet Visual */}
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Source Balance:</span>
              <span className="font-mono text-white font-semibold">
                ${availableMax.toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded-xl">
              {direction === "HOLDING_TO_PERSONAL"
                ? "Moving unencumbered Holding Wallet funds to Personal Trading Wallet for 5-Minute Binary Options trading."
                : "Moving free trading profits from Personal Trading Wallet back to main Holding Wallet."}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Transfer Amount ($)</label>
              <button
                type="button"
                onClick={() => setAmount(availableMax.toString())}
                className="text-[10px] text-sky-400 hover:underline font-semibold"
              >
                MAX (${availableMax.toFixed(2)})
              </button>
            </div>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
          >
            {loading ? "Processing Transfer..." : "Confirm Wallet Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
}
