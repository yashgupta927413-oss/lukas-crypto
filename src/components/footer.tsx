import Link from "next/link";
import { Shield, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#07090e] border-t border-[#1f2430] text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#181e2b] border border-[#2b3548] flex items-center justify-center text-[#f0b90b] font-bold text-sm">
                L
              </div>
              <span className="text-white font-bold text-sm tracking-tight">LUKAS FINANCIAL</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Institutional digital assets exchange and quantitative yield infrastructure powered by real-time market data feeds.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono">Platform</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Markets Overview</Link></li>
              <li><Link href="/options" className="hover:text-white transition-colors">Options Desk</Link></li>
              <li><Link href="/bots" className="hover:text-white transition-colors">Yield Vaults</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Portfolio</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono">Security</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><span className="text-slate-300">• Segregated Account Model</span></li>
              <li><span className="text-slate-300">• Cold Storage Custody</span></li>
              <li><span className="text-slate-300">• SSL Encrypted Sessions</span></li>
              <li><span className="text-slate-300">• Instant Webhook Audits</span></li>
            </ul>
          </div>

          {/* Risk & Compliance */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono">Risk &amp; Disclosures</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Trading digital options involves substantial risk of loss and is not suitable for all investors. Please ensure you fully understand the risks involved before trading.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1f2430] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} Lukas Financial Ltd. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Binance Market Feed Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
