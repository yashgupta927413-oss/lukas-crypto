"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Wallet,
  TrendingUp,
  Bot,
  ShieldAlert,
  LogOut,
  User,
  ChevronDown,
  ArrowRightLeft,
  Coins,
  Globe,
  Menu,
  X,
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

  // Close dropdown on outside click
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
    { name: "Home", href: "/", icon: Globe },
    { name: "Dashboard", href: "/dashboard", icon: Wallet },
    { name: "AI Bots", href: "/bots", icon: Bot },
    { name: "1m/5m Options", href: "/options", icon: TrendingUp },
  ];

  if ((session?.user as any)?.role === "ADMIN") {
    navLinks.push({ name: "Admin Panel", href: "/admin", icon: ShieldAlert });
  }

  const totalNetWorth =
    wallets.holdingBalance + wallets.botBalance + wallets.personalTradingBalance;

  return (
    <>
      {/* Top Ticker Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/60 text-xs py-1.5 px-4 flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-6 text-slate-300">
        <div className="flex items-center gap-1.5 font-semibold text-sky-400">
          <Coins className="w-3.5 h-3.5 animate-pulse" />
          <span>BINANCE LIVE:</span>
        </div>
        {Object.entries(prices).map(([symbol, data]) => (
          <div key={symbol} className="flex items-center gap-2 font-mono">
            <span className="text-slate-400 font-sans">{symbol.replace("USDT", "")}/USDT</span>
            <span className="font-semibold text-slate-100">${data.price.toLocaleString()}</span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                data.change24h >= 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {data.change24h >= 0 ? "+" : ""}
              {data.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">
                LUKAS<span className="text-sky-400"> CRYPTO</span>
              </span>
              <span className="block text-[9px] text-sky-400 font-mono tracking-widest uppercase font-bold">
                MANAGEMENT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const targetHref =
                !session && link.href === "/dashboard"
                  ? "/login?callbackUrl=/dashboard"
                  : link.href;

              return (
                <Link
                  key={link.href}
                  href={targetHref}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Total Net Worth
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-slate-950/98 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        3-Wallet Balances
                      </span>
                      <button
                        onClick={() => {
                          setIsWalletDropdownOpen(false);
                          setIsTransferModalOpen(true);
                        }}
                        className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Transfer
                      </button>
                    </div>

                    <div className="space-y-3 my-3">
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-300 block">
                            Holding Wallet
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Deposits & Unencumbered Funds
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-white">
                          ${wallets.holdingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-slate-300 block">
                              Bot Trading Wallet
                            </span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">
                              LOCKED
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Active AI Bot Principal + ROI
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-amber-400">
                          ${wallets.botBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-300 block">
                            Personal Trading Wallet
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Dedicated to 1m/5m Options
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-sky-400">
                          ${wallets.personalTradingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 overflow-hidden text-ellipsis">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[150px]">{session.user?.email}</span>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-semibold shadow-lg shadow-sky-500/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const targetHref =
                !session && link.href === "/dashboard"
                  ? "/login?callbackUrl=/dashboard"
                  : link.href;

              return (
                <Link
                  key={link.href}
                  href={targetHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}

            {!session && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-bold text-slate-300 bg-slate-900 rounded-xl border border-slate-800"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-bold text-slate-950 bg-sky-500 rounded-xl shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <WalletTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        onSuccess={fetchWallets}
      />
    </>
  );
}
