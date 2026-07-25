import Link from "next/link";
import BrandLogo from "./brand-logo";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <BrandLogo size="sm" textColor="text-white" />
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Institutional digital asset options trading desk and structured quantitative yield vaults. Sourced directly from live spot orderbook data feeds.
            </p>
          </div>

          {/* Service Links */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono tracking-wider">Products</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Markets</Link></li>
              <li><Link href="/options" className="hover:text-white transition-colors">Options Trading</Link></li>
              <li><Link href="/bots" className="hover:text-white transition-colors">Yield Vaults</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Portfolio Overview</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono tracking-wider">Security</span>
            <ul className="space-y-1.5 text-slate-400">
              <li><span className="text-slate-300">• Segregated Account Model</span></li>
              <li><span className="text-slate-300">• Cold Asset Reserve Storage</span></li>
              <li><span className="text-slate-300">• 256-Bit Encrypted Data SSL</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <span className="text-white font-bold block text-xs uppercase font-mono tracking-wider">Risk Notice</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Options trading involves risk of loss. Ensure you fully understand contract settlement mechanisms before entering market trades.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 font-mono">
          <div>© {new Date().getFullYear()} Lukas Financial Ltd. All rights reserved.</div>
          <div>Binance Market API Stream Engine</div>
        </div>
      </div>
    </footer>
  );
}
