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
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-[#181a20] border border-[#2b313a] rounded-lg p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create Trader Account</h1>
          <p className="text-xs text-[#848e9c]">Instant access to options desk & yield vaults</p>
        </div>

        {/* Free Trial Banner */}
        <div className="p-3 bg-[#0ecb81]/10 border border-[#0ecb81]/30 rounded flex items-center gap-3 font-mono">
          <div className="w-8 h-8 rounded bg-[#0ecb81]/20 flex items-center justify-center text-[#0ecb81] font-bold text-sm shrink-0">
            🎁
          </div>
          <div>
            <span className="text-xs font-bold text-[#0ecb81] block">$100 Welcome Credit Included</span>
            <span className="text-[10px] text-slate-300 font-sans">
              Credited automatically to your vault account upon registration
            </span>
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

          <div className="space-y-1">
            <label className="text-xs text-[#848e9c] block font-sans">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#848e9c] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#2b313a] text-xs text-[#848e9c]">
          Already registered?{" "}
          <Link href="/login" className="text-[#f0b90b] font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
