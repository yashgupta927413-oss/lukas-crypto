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
    <header className="sticky top-0 z-40 w-full border-b border-[#2b313a] bg-[#0b0e11]">
      {/* Top Spot Ticker Tape */}
      <div className="border-b border-[#2b313a]/50 bg-[#07090b] text-[11px] font-mono py-1 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6 overflow-x-auto scrollbar-none text-[#848e9c]">
          <div className="flex items-center gap-6 shrink-0">
            {Object.entries(prices).map(([sym, val]) => (
              <div key={sym} className="flex items-center gap-2">
                <span className="font-sans font-semibold text-[#eaecef]">{sym.replace("USDT", "/USDT")}</span>
                <span className="text-white font-bold">${val.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={val.change24h >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}>
                  {val.change24h >= 0 ? "+" : ""}{val.change24h}%
                </span>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[#848e9c] text-[11px] font-sans">
            <span>Binance Market Spot Feed</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <BrandLogo size="sm" />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold transition-colors py-4 border-b-2 ${
                    isActive
                      ? "text-[#f0b90b] border-[#f0b90b]"
                      : "text-[#848e9c] border-transparent hover:text-white"
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
                  className="flex items-center gap-2 bg-[#181a20] hover:bg-[#1e2329] border border-[#2b313a] px-3 py-1.5 rounded text-xs transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#f0b90b]" />
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-[#848e9c] block font-sans leading-none">Assets</span>
                    <span className="text-white font-bold">${totalBalance.toFixed(2)}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#848e9c] ml-1" />
                </button>

                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#181a20] border border-[#2b313a] rounded-lg p-3 shadow-2xl space-y-3 z-50">
                    <div className="flex justify-between items-center pb-2 border-b border-[#2b313a]">
                      <div>
                        <span className="text-[10px] text-[#848e9c] font-mono block">Account</span>
                        <span className="text-xs font-bold text-white truncate max-w-[160px] block">
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

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center p-2 rounded bg-[#0b0e11] border border-[#2b313a]">
                        <span className="text-[#848e9c] font-sans">Holding Account</span>
                        <span className="text-white font-bold">${Number(wallets.holdingBalance).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-[#0b0e11] border border-[#2b313a]">
                        <span className="text-[#848e9c] font-sans">Earn Vaults</span>
                        <span className="text-[#f0b90b] font-bold">${Number(wallets.botBalance).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-[#0b0e11] border border-[#2b313a]">
                        <span className="text-[#848e9c] font-sans">Options Trading</span>
                        <span className="text-[#0ecb81] font-bold">${Number(wallets.personalTradingBalance).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsWalletDropdownOpen(false);
                        setIsTransferModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-[#2b313a] hover:bg-[#474d57] text-slate-200 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#f0b90b]" />
                      Transfer Funds
                    </button>

                    <div className="pt-2 border-t border-[#2b313a] flex justify-between items-center text-xs">
                      <Link
                        href="/dashboard"
                        className="text-[#f0b90b] hover:underline font-semibold"
                        onClick={() => setIsWalletDropdownOpen(false)}
                      >
                        Portfolio →
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="text-[#f6465d] hover:underline font-semibold flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-[#1e2329] hover:bg-[#2b313a] border border-[#2b313a] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded text-xs font-bold bg-[#f0b90b] text-[#0b0e11] hover:bg-[#d97706] transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-[#848e9c] hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#2b313a] bg-[#0b0e11] px-4 py-4 space-y-3 font-sans animate-in slide-in-from-top-2">
          {session && (
            <div className="p-3 bg-[#181a20] rounded border border-[#2b313a] space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#848e9c]">
                <span>Portfolio Balance:</span>
                <span className="text-[#f0b90b] font-bold">${totalBalance.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsTransferModalOpen(true);
                }}
                className="w-full py-1.5 bg-[#2b313a] text-white rounded text-xs font-bold font-sans flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#f0b90b]" />
                <span>Transfer Funds</span>
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-lg text-sm font-bold transition-colors ${
                  pathname === link.href ? "bg-[#181a20] text-[#f0b90b]" : "text-slate-300 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {session ? (
            <div className="pt-2 border-t border-[#2b313a] flex justify-between items-center text-xs">
              <span className="text-[#848e9c] font-mono truncate max-w-[180px]">{session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="text-[#f6465d] font-bold hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#2b313a] grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center rounded text-xs font-bold text-white bg-[#1e2329] border border-[#2b313a]"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center rounded text-xs font-bold bg-[#f0b90b] text-[#0b0e11]"
              >
                Register
              </Link>
            </div>
          )}
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
