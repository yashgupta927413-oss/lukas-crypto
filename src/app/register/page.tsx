"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Lock, Mail, ArrowRight, Gift } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-sky-500/20">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Join Lukas Crypto Management</h1>
          <p className="text-xs text-slate-400 mt-1">Get instant access to $100 Free Trial Credit</p>
        </div>

        {/* Free Trial Banner */}
        <div className="mb-6 p-3 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Gift className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 block">$100 Free Trial Included</span>
            <span className="text-[10px] text-slate-300">
              Allocated automatically upon sign-up for AI Bot Trading
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : "Register & Claim $100 Trial"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
