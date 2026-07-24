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
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to transfer funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0e11]/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#181a20] border border-[#2b313a] rounded-lg p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 font-sans space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#2b313a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#f0b90b]/10 text-[#f0b90b] flex items-center justify-center border border-[#f0b90b]/30">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Instant Wallet Transfer</h3>
              <p className="text-[11px] text-[#848e9c]">Move capital between segregated balances</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#848e9c] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-[#f6465d]/10 border border-[#f6465d]/30 text-[#f6465d] text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded bg-[#0ecb81]/10 border border-[#0ecb81]/30 text-[#0ecb81] text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4 font-mono text-xs">
          {/* Direction Toggle */}
          <div className="space-y-1.5 font-sans">
            <label className="text-xs text-[#848e9c] block">
              Transfer Route
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0b0e11] rounded border border-[#2b313a]">
              <button
                type="button"
                onClick={() => setDirection("HOLDING_TO_PERSONAL")}
                className={`py-2 px-2 rounded text-[11px] font-bold transition-all ${
                  direction === "HOLDING_TO_PERSONAL"
                    ? "bg-[#263044] text-[#f0b90b] shadow"
                    : "text-[#848e9c] hover:text-white"
                }`}
              >
                Holding → Options Desk
              </button>
              <button
                type="button"
                onClick={() => setDirection("PERSONAL_TO_HOLDING")}
                className={`py-2 px-2 rounded text-[11px] font-bold transition-all ${
                  direction === "PERSONAL_TO_HOLDING"
                    ? "bg-[#263044] text-[#f0b90b] shadow"
                    : "text-[#848e9c] hover:text-white"
                }`}
              >
                Options Desk → Holding
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-sans">
              <label className="text-[#848e9c]">Transfer Amount ($)</label>
              <button
                type="button"
                onClick={() => setAmount(availableMax.toString())}
                className="text-[#f0b90b] font-bold hover:underline"
              >
                Max: ${availableMax.toFixed(2)}
              </button>
            </div>

            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0b0e11] border border-[#2b313a] rounded px-3 py-2 text-sm text-white font-bold outline-none focus:border-[#f0b90b]"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-[#0b0e11] rounded border border-[#2b313a] space-y-1 text-xs">
            <div className="flex justify-between text-[#848e9c]">
              <span>Source Account:</span>
              <span className="text-white font-bold">
                {direction === "HOLDING_TO_PERSONAL" ? "Holding Wallet" : "Options Trading Wallet"}
              </span>
            </div>
            <div className="flex justify-between text-[#848e9c]">
              <span>Destination:</span>
              <span className="text-[#0ecb81] font-bold">
                {direction === "HOLDING_TO_PERSONAL" ? "Options Trading Wallet" : "Holding Wallet"}
              </span>
            </div>
            <div className="flex justify-between text-[#848e9c]">
              <span>Transfer Fee:</span>
              <span className="text-[#0ecb81] font-bold">$0.00 (Zero Fee)</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-[#181a20] hover:bg-[#2b313a] text-white font-bold rounded text-xs border border-[#2b313a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2.5 bg-[#f0b90b] hover:bg-[#d97706] text-[#0b0e11] font-bold rounded text-xs"
            >
              {loading ? "Transferring..." : "Confirm Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
