"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import { ShieldCheck, Lock, Eye, FileText, Bot } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>NON-CUSTODIAL DATA PROTECTION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Last Updated: January 2026 | Lukas Crypto Management Platform
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" />
              1. Non-Custodial & Privacy-First Principle
            </h2>
            <p>
              Lukas Crypto Management is built upon a non-custodial, decentralized framework. We do not store private key material or personal identify documents. Account access is managed securely via encrypted session tokens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              2. Information We Collect
            </h2>
            <p>
              We only collect minimal technical data necessary to operate the platform:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs font-mono">
              <li>Account email address for authentication</li>
              <li>Encrypted user wallet balances (Holding, Bot Trading, Personal Options)</li>
              <li>Binary options trade records and AI bot contract activity</li>
              <li>Network IP logs for anti-fraud and session security</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              3. Data Usage & Security
            </h2>
            <p>
              Your information is never sold or shared with third parties. Data is strictly utilized for real-time ledger accounting, processing 1-minute/5-minute binary options settlements, and updating daily yield logs.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Questions regarding our Privacy Policy?</span>
            <Link href="/contact" className="text-sky-400 hover:underline font-bold">
              Contact Support →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#2b313a] py-6 text-center text-xs text-[#848e9c] font-mono">
        © {new Date().getFullYear()} Lukas Financial Ltd. All rights reserved.
      </footer>
    </div>
  );
}
