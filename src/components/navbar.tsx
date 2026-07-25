"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Wallet,
  LogOut,
  ChevronDown,
  ArrowRightLeft,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";
import WalletTransferModal from "./wallet-transfer-modal";
import BrandLogo from "./brand-logo";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [prices, setPrices] = useState<Record<string, { price: number; change24h: number }>>({
    BTCUSDT: { price: 94500, change24h: 2.5 },
    ETHUSDT: { price: 2780, change24h: -0.8 },
    SOLUSDT: { price: 195, change24h: 4.2 },
    XRPUSDT: { price: 2.45, change24h: 8.1 },
  });

  const [wallets, setWallets] = useState({
    holdingBalance: 0,
    botBalance: 0,
    personalTradingBalance: 0,
  });

  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/prices");
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
        }
      } catch (e) {
        console.error("Price ticker error", e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchWallets = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/user/wallet");
      if (res.ok) {
        const data = await res.json();
        setWallets(data);
      }
    } catch (e) {
      console.error("Wallet fetch error", e);
    }
  };

  useEffect(() => {
    fetchWallets();
    const interval = setInterval(fetchWallets, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const navLinks = [
    { name: "Markets", href: "/" },
    { name: "Options Trading", href: "/options" },
    { name: "Yield Vaults", href: "/bots" },
    { name: "Portfolio", href: "/dashboard" },
  ];

  const totalBalance =
    Number(wallets.holdingBalance) +
    Number(wallets.botBalance) +
    Number(wallets.personalTradingBalance);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Institutional Ticker Tape */}
      <div className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-mono py-1.5 px-4 sm:px-8 select-none">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6 overflow-x-auto scrollbar-none text-slate-500">
          <div className="flex items-center gap-6 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans border-r border-slate-200 pr-3">
              SPOT INDEX
            </span>
            {Object.entries(prices).map(([sym, val]) => (
              <div key={sym} className="flex items-center gap-2">
                <span className="font-sans font-bold text-slate-800">{sym.replace("USDT", "/USDT")}</span>
                <span className="text-slate-900 font-bold">${val.price < 10 ? val.price.toFixed(4) : val.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={`font-bold text-[10px] ${val.change24h >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {val.change24h >= 0 ? "▲ +" : "▼ "}{val.change24h}%
                </span>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-5 text-slate-500 text-[11px] font-sans shrink-0">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-600">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>24H VOL: $18.42M</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ENGINE: 99.99% SLA</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[10px] border-l border-slate-200 pl-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>COLD STORAGE SECURED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <BrandLogo size="sm" textColor="text-slate-900" />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold transition-all py-5 border-b-2 ${
                    isActive
                      ? "text-blue-600 border-blue-600 font-black"
                      : "text-slate-600 border-transparent hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Account Actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs transition-all shadow-2xs active:scale-[0.98]"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-slate-400 block font-sans leading-none uppercase font-bold">Total Net Worth</span>
                    <span className="text-slate-900 font-black text-xs">${totalBalance.toFixed(2)}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl space-y-3 z-50 animate-in zoom-in-95 font-sans">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold">Authenticated Account</span>
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[180px] block font-mono">
                          {session.user?.email}
                        </span>
                      </div>
                      {(session.user as any)?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider"
                        >
                          ADMIN
                        </Link>
                      )}
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <span className="text-slate-700 font-sans font-bold block text-[11px]">Holding Wallet</span>
                          <span className="text-[10px] text-slate-400 font-sans">Unencumbered Fiat/Crypto</span>
                        </div>
                        <span className="text-slate-900 font-bold text-xs">${Number(wallets.holdingBalance).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <span className="text-slate-700 font-sans font-bold block text-[11px]">Earn Vaults</span>
                          <span className="text-[10px] text-amber-600 font-sans">Structured Staking</span>
                        </div>
                        <span className="text-amber-700 font-bold text-xs">${Number(wallets.botBalance).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <span className="text-slate-700 font-sans font-bold block text-[11px]">Options Desk</span>
                          <span className="text-[10px] text-emerald-600 font-sans">Binary Derivatives</span>
                        </div>
                        <span className="text-emerald-700 font-bold text-xs">${Number(wallets.personalTradingBalance).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsWalletDropdownOpen(false);
                        setIsTransferModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Instant Transfer Between Wallets
                    </button>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
                      <Link
                        href="/dashboard"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() => setIsWalletDropdownOpen(false)}
                      >
                        Portfolio Overview →
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs active:scale-[0.98]"
                >
                  Register Account
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 bg-slate-50"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl font-sans">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3.5 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600 font-black" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Wallet Transfer Modal */}
      <WalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        onSuccess={() => fetchWallets()}
      />
    </header>
  );
}
