"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Gift } from "lucide-react";
import BrandLogo from "@/components/brand-logo";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" textColor="text-slate-900" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Trader Account</h1>
          <p className="text-xs text-slate-500 font-sans">Instant access to options desk & yield vaults</p>
        </div>

        {/* Free Trial Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 font-mono">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
            🎁
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 block">$100 Welcome Credit Included</span>
            <span className="text-[10px] text-emerald-600 font-sans">
              Credited automatically to your vault account upon registration
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 font-sans">
            <label className="text-xs text-slate-600 font-bold block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="text-xs text-slate-600 font-bold block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="text-xs text-slate-600 font-bold block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            <span>{loading ? "Creating account..." : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-sans pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
