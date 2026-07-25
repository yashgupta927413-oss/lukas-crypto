"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/brand-logo";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleDemoLogin = (role: "user" | "admin") => {
    if (role === "admin") {
      setEmail("admin@crypto.com");
      setPassword("admin123");
    } else {
      setEmail("user@crypto.com");
      setPassword("user123");
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <BrandLogo size="lg" textColor="text-slate-900" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Sign In to Your Account</h1>
        <p className="text-xs text-slate-500 font-sans">Access options trading desk and yield vaults</p>
      </div>

      {/* Quick Demo Credentials */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
        <div className="text-slate-500 font-sans font-bold mb-2 text-[11px] uppercase">Quick Demo Access</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDemoLogin("user")}
            type="button"
            className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-left transition-colors font-sans shadow-2xs"
          >
            <span className="block font-bold text-slate-900 text-xs">Trader Account</span>
            <span className="text-[10px] text-slate-500 font-mono">user@crypto.com</span>
          </button>
          <button
            onClick={() => handleDemoLogin("admin")}
            type="button"
            className="py-2 px-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-left transition-colors font-sans shadow-2xs"
          >
            <span className="block font-bold text-blue-900 text-xs">Admin Control</span>
            <span className="text-[10px] text-blue-600 font-mono">admin@crypto.com</span>
          </button>
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
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
        >
          <span>{loading ? "Signing in..." : "Sign In to Platform"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 font-sans pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 font-bold hover:underline">
          Register now →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 py-4">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 font-bold">
          ← Back to Markets
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="text-slate-400 font-mono text-xs">Loading sign-in form...</div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 font-mono">
        © {new Date().getFullYear()} Lukas Financial Ltd. All rights reserved.
      </footer>
    </div>
  );
}
