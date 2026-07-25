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
    { name: "Trade Options", href: "/options" },
    { name: "Earn Vaults", href: "/bots" },
    { name: "Portfolio", href: "/dashboard" },
  ];

  const totalBalance =
    Number(wallets.holdingBalance) +
    Number(wallets.botBalance) +
    Number(wallets.personalTradingBalance);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Spot Ticker Tape */}
      <div className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-mono py-1 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6 overflow-x-auto scrollbar-none text-slate-500">
          <div className="flex items-center gap-6 shrink-0">
            {Object.entries(prices).map(([sym, val]) => (
              <div key={sym} className="flex items-center gap-2">
                <span className="font-sans font-bold text-slate-800">{sym.replace("USDT", "/USDT")}</span>
                <span className="text-slate-900 font-bold">${val.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={`font-bold ${val.change24h >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {val.change24h >= 0 ? "+" : ""}{val.change24h}%
                </span>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[11px] font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Binance Market Spot Index</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo */}
          <BrandLogo size="sm" textColor="text-slate-900" />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold transition-colors py-4 border-b-2 ${
                    isActive
                      ? "text-blue-600 border-blue-600 font-bold"
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
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs"
                >
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-slate-500 block font-sans leading-none uppercase font-bold">Total Portfolio</span>
                    <span className="text-slate-900 font-bold">${totalBalance.toFixed(2)}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xl space-y-3 z-50 animate-in zoom-in-95">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block uppercase">Account</span>
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[160px] block">
                          {session.user?.email}
                        </span>
                      </div>
                      {(session.user as any)?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200"
                        >
                          ADMIN
                        </Link>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-600 font-sans">Holding Wallet</span>
                        <span className="text-slate-900 font-bold">${Number(wallets.holdingBalance).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-600 font-sans">Earn Vaults</span>
                        <span className="text-amber-600 font-bold">${Number(wallets.botBalance).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-600 font-sans">Options Trading</span>
                        <span className="text-emerald-600 font-bold">${Number(wallets.personalTradingBalance).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsWalletDropdownOpen(false);
                        setIsTransferModalOpen(true);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Transfer Funds
                    </button>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <Link
                        href="/dashboard"
                        className="text-blue-600 hover:underline font-bold"
                        onClick={() => setIsWalletDropdownOpen(false)}
                      >
                        Portfolio →
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-100"
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
