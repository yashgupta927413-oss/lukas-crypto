"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
  Gift,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: "user" | "admin") => {
    const demoEmail = type === "admin" ? "admin@crypto.com" : "user@crypto.com";
    const demoPassword = type === "admin" ? "admin123" : "user123";

    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: demoEmail,
      password: demoPassword,
    });

    if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Demo login failed");
      setLoading(false);
    }
  };

  const botPlans = [
    {
      name: "1 Month Growth Bot",
      duration: "30 Days",
      totalRoi: "+15% EST.",
      dailyYield: "~0.50% / Day",
      minDep: "$500",
      accent: "border-sky-500/30 text-sky-400",
    },
    {
      name: "3 Month Yield Maximizer",
      duration: "90 Days",
      totalRoi: "+55% EST.",
      dailyYield: "~0.61% / Day",
      minDep: "$500",
      accent: "border-indigo-500/30 text-indigo-400",
    },
    {
      name: "6 Month Pro Institutional",
      duration: "180 Days",
      totalRoi: "+130% EST.",
      dailyYield: "~0.72% / Day",
      minDep: "$1,000",
      accent: "border-purple-500/30 text-purple-400",
    },
    {
      name: "1 Year Elite AI Strategy",
      duration: "365 Days",
      totalRoi: "+320% EST.",
      dailyYield: "~0.88% / Day",
      minDep: "$2,500",
      accent: "border-emerald-500/30 text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* LEFT COLUMN LOGIN FORM */}
        <div className="lg:col-span-6 glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-500/20">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-400 mt-1">Sign in to Lukas Crypto Management AI Bots & Options</p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>QUICK DEMO ACCESS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin("user")}
                type="button"
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-medium transition text-left"
              >
                <span className="block font-bold text-white">Demo User</span>
                <span className="text-[9px] text-slate-400">user@crypto.com</span>
              </button>
              <button
                onClick={() => handleDemoLogin("admin")}
                type="button"
                className="py-2 px-3 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 rounded-xl text-[11px] font-medium transition text-left"
              >
                <span className="block font-bold text-amber-200">Demo Admin</span>
                <span className="text-[9px] text-amber-400">admin@crypto.com</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
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
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 group disabled:opacity-50 uppercase tracking-wider text-xs"
            >
              <span>{loading ? "Signing in..." : "Sign In to Platform"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{" "}
            <Link href="/register" className="text-sky-400 hover:underline font-semibold">
              Create Free Account
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN DAILY PROFIT ON EACH PLAN SHOWCASE */}
        <div className="lg:col-span-6 glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold text-white">AI Bot Daily Profit Breakdown</h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              UPDATED DAILY VIA ADMIN
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Every active bot plan earns <strong className="text-white font-mono">daily profit injections</strong> updated daily via the Admin Panel directly into your contract:
          </p>

          <div className="space-y-3">
            {botPlans.map((plan) => (
              <div
                key={plan.name}
                className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between transition hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{plan.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                      {plan.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-400">
                    <span>Min: {plan.minDep}</span>
                    <span>Total ROI: <strong className="text-slate-200">{plan.totalRoi}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-sans">Est. Daily Profit</span>
                  <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
                    {plan.dailyYield}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Gift className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-sky-300">$100 Free Trial Credit</strong> automatically unlocks on your first bot contract. Combine with your Holding Wallet to start earning daily profits!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
