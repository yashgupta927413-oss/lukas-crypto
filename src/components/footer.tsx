import Link from "next/link";
import BrandLogo from "./brand-logo";

export default function Footer() {
  return (
    <footer className="w-full bg-[#07090b] border-t border-[#2b313a] text-[#848e9c] text-xs py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-2">
            <BrandLogo size="sm" />
            <p className="text-[#848e9c] leading-relaxed text-[11px]">
              Institutional digital asset options trading desk and structured quantitative yield vaults. Sourced directly from live spot orderbook data feeds.
            </p>
          </div>

          {/* Service Links */}
          <div className="space-y-1.5">
            <span className="text-white font-bold block text-xs uppercase font-mono">Products</span>
            <ul className="space-y-1 text-[#848e9c]">
              <li><Link href="/" className="hover:text-white transition-colors">Markets</Link></li>
              <li><Link href="/options" className="hover:text-white transition-colors">Options Trading</Link></li>
              <li><Link href="/bots" className="hover:text-white transition-colors">Yield Vaults</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Portfolio</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-1.5">
            <span className="text-white font-bold block text-xs uppercase font-mono">Security</span>
            <ul className="space-y-1 text-[#848e9c]">
              <li><span className="text-slate-300">• Segregated Account Model</span></li>
              <li><span className="text-slate-300">• Cold Asset Storage</span></li>
              <li><span className="text-slate-300">• SSL Encrypted Data</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-1.5">
            <span className="text-white font-bold block text-xs uppercase font-mono">Risk Notice</span>
            <p className="text-[11px] text-[#848e9c] leading-relaxed">
              Trading options involves risk. Ensure you understand binary option settlement mechanisms before trading.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2b313a] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#848e9c] font-mono">
          <div>© {new Date().getFullYear()} Lukas Financial Ltd. All rights reserved.</div>
          <div>Powered by Binance Market API</div>
        </div>
      </div>
    </footer>
  );
}
