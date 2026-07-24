"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
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
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-[#181a20] border border-[#2b313a] rounded-lg p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-8 h-8 rounded bg-[#f0b90b] text-[#0b0e11] font-black text-lg flex items-center justify-center">
              L
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              LUKAS <span className="text-[#f0b90b]">FINANCIAL</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Sign In to Your Account</h1>
          <p className="text-xs text-[#848e9c]">Access options trading desk and yield vaults</p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="p-3 bg-[#0b0e11] rounded border border-[#2b313a] text-xs font-mono">
          <div className="text-[#848e9c] font-sans font-semibold mb-2 text-[11px] uppercase">Quick Demo Access</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin("user")}
              type="button"
              className="py-1.5 px-2.5 bg-[#181a20] hover:bg-[#2b313a] text-[#848e9c] hover:text-white rounded border border-[#2b313a] text-left transition-colors font-sans"
            >
              <span className="block font-bold text-white text-xs">Trader Account</span>
              <span className="text-[10px] text-[#848e9c] font-mono">user@crypto.com</span>
            </button>
            <button
              onClick={() => handleDemoLogin("admin")}
              type="button"
              className="py-1.5 px-2.5 bg-[#f0b90b]/10 border border-[#f0b90b]/30 hover:bg-[#f0b90b]/20 text-[#f0b90b] rounded text-left transition-colors font-sans"
            >
              <span className="block font-bold text-white text-xs">Admin Control</span>
              <span className="text-[10px] text-[#f0b90b] font-mono">admin@crypto.com</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded bg-[#f6465d]/10 border border-[#f6465d]/30 text-[#f6465d] text-xs font-semibold text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-[#848e9c] block font-sans">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#848e9c] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0b0e11] border border-[#2b313a] rounded pl-9 pr-3 py-2 text-xs font-mono text-white outline-none focus:border-[#f0b90b]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#848e9c] block font-sans">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#848e9c] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b0e11] border border-[#2b313a] rounded pl-9 pr-3 py-2 text-xs font-mono text-white outline-none focus:border-[#f0b90b]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#f0b90b] hover:bg-[#d97706] text-[#0b0e11] font-bold rounded text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? "Signing in..." : "Log In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#2b313a] text-xs text-[#848e9c]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#f0b90b] font-bold hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
