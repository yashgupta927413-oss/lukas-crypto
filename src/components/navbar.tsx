"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Wallet,
  TrendingUp,
  Vault,
  LogOut,
  ChevronDown,
  ArrowRightLeft,
  Menu,
  X,
  BarChart2,
  Lock,
} from "lucide-react";
import WalletTransferModal from "./wallet-transfer-modal";

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
    { name: "Markets", href: "/", icon: BarChart2 },
    { name: "Options Desk", href: "/options", icon: TrendingUp },
    { name: "Yield Vaults", href: "/bots", icon: Vault },
    { name: "Portfolio", href: "/dashboard", icon: Wallet },
  ];

  const totalBalance =
    Number(wallets.holdingBalance) +
    Number(wallets.botBalance) +
    Number(wallets.personalTradingBalance);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f2430] bg-[#0b0e14]/98 backdrop-blur-md">
      {/* Ticker Tape */}
      <div className="border-b border-[#1f2430]/60 bg-[#07090e] text-[11px] font-mono py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 overflow-x-auto scrollbar-none text-slate-400">
          <div className="flex items-center gap-6 shrink-0">
            {Object.entries(prices).map(([sym, val]) => (
              <div key={sym} className="flex items-center gap-2">
                <span className="font-sans font-semibold text-slate-300">{sym.replace("USDT", "/USDT")}</span>
                <span className="text-white font-bold">${val.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={val.change24h >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}>
                  {val.change24h >= 0 ? "+" : ""}{val.change24h}%
                </span>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-4 text-slate-400 text-[10px] font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]"></span>
              <span>Binance Market Feed</span>
            </span>
            <span>•</span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#181e2b] border border-[#2b3548] flex items-center justify-center text-[#f0b90b] font-bold text-base">
              L
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-tight leading-none flex items-center gap-1">
                LUKAS <span className="text-slate-400 font-normal">FINANCIAL</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mt-0.5">
                Digital Assets Exchange
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#181e2b] text-white border border-[#2b3548]"
                      : "text-slate-400 hover:text-white hover:bg-[#121620]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#f0b90b]" : "text-slate-400"}`} />
                  <span>{link.name}</span>
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
                  className="flex items-center gap-2.5 bg-[#121620] hover:bg-[#181e2b] border border-[#1f2430] hover:border-[#2b3548] px-3.5 py-2 rounded-xl text-xs transition-all"
                >
                  <Wallet className="w-4 h-4 text-[#f0b90b]" />
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-slate-500 block font-sans leading-none uppercase">Portfolio Balance</span>
                    <span className="text-white font-bold">${totalBalance.toFixed(2)}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#121620] border border-[#1f2430] rounded-2xl p-4 shadow-2xl space-y-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center pb-2 border-b border-[#1f2430]">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">Account</span>
                        <span className="text-xs font-bold text-white truncate max-w-[180px] block">
                          {session.user?.email}
                        </span>
                      </div>
                      {(session.user as any)?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="text-[10px] font-bold bg-[#f0b90b]/10 text-[#f0b90b] px-2 py-0.5 rounded border border-[#f0b90b]/30"
                        >
                          ADMIN
                        </Link>
                      )}
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-[#0b0e14] border border-[#1f2430]">
                        <span className="text-slate-400 font-sans">Holding Account</span>
                        <span className="text-white font-bold">${Number(wallets.holdingBalance).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-[#0b0e14] border border-[#1f2430]">
                        <span className="text-slate-400 font-sans">Yield Vaults</span>
                        <span className="text-[#f0b90b] font-bold">${Number(wallets.botBalance).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-[#0b0e14] border border-[#1f2430]">
                        <span className="text-slate-400 font-sans">Options Trading</span>
                        <span className="text-[#0ecb81] font-bold">${Number(wallets.personalTradingBalance).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsWalletDropdownOpen(false);
                        setIsTransferModalOpen(true);
                      }}
                      className="w-full py-2 bg-[#181e2b] hover:bg-[#232a3a] text-slate-200 rounded-xl text-xs font-bold border border-[#2b3548] flex items-center justify-center gap-2 transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#f0b90b]" />
                      Transfer Funds
                    </button>

                    <div className="pt-2 border-t border-[#1f2430] flex justify-between items-center">
                      <Link
                        href="/dashboard"
                        className="text-xs text-[#38bdf8] hover:underline font-semibold"
                        onClick={() => setIsWalletDropdownOpen(false)}
                      >
                        Portfolio Details →
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="text-xs text-[#f6465d] hover:underline font-semibold flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#121620] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f0b90b] text-[#0b0e14] hover:bg-[#d97706] transition-colors shadow"
                >
                  Open Account
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#1f2430] bg-[#0b0e14] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold ${
                pathname === link.href ? "bg-[#181e2b] text-white" : "text-slate-400"
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      )}

      <WalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        onSuccess={fetchWallets}
      />
    </header>
  );
}
