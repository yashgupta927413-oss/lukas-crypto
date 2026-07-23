import Link from "next/link";
import { ShieldCheck, Lock, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#07090f] border-t border-[#1e2638] text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#192233] border border-[#2b374e] flex items-center justify-center text-[#f0b90b] font-black">
                L
              </div>
              <span className="text-white font-extrabold text-sm">LUKAS CRYPTO</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Institutional cryptocurrency options &amp; quantitative AI yield platform built on real-time Binance WebSocket price feeds.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono">Platform</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Markets Overview</Link></li>
              <li><Link href="/options" className="hover:text-white transition-colors">1m &amp; 5m Options Desk</Link></li>
              <li><Link href="/bots" className="hover:text-white transition-colors">AI Quant Bots</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Account Dashboard</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono">Security</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><span className="text-slate-300">● Non-Custodial Deposits</span></li>
              <li><span className="text-slate-300">● Isolated 3-Wallet Architecture</span></li>
              <li><span className="text-slate-300">● 256-Bit SSL Encryption</span></li>
              <li><span className="text-slate-300">● Instant On-Chain Webhooks</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono">Legal &amp; Compliance</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/risk-disclosure" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1e2638] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} Lukas Crypto Management. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Trading involve risk. Past performance does not guarantee future results.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
