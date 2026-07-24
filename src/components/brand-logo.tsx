"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ size = "md" }: BrandLogoProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const boxSize = isSm ? "w-7 h-7 text-xs" : isLg ? "w-10 h-10 text-xl" : "w-8 h-8 text-sm";
  const textSize = isSm ? "text-sm" : isLg ? "text-xl" : "text-base";

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      <div className={`${boxSize} rounded bg-gradient-to-br from-[#f0b90b] to-[#d97706] text-[#0b0e11] font-black flex items-center justify-center shadow-lg shadow-[#f0b90b]/10 group-hover:scale-105 transition-transform`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-[#0b0e11]"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className={`${textSize} font-bold tracking-tight text-white font-sans`}>
        LUKAS <span className="text-[#f0b90b]">FINANCIAL</span>
      </span>
    </Link>
  );
}
