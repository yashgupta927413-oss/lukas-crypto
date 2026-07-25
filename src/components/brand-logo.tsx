"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  textColor?: string;
}

export default function BrandLogo({ size = "md", textColor = "text-slate-900" }: BrandLogoProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const boxSize = isSm ? "w-7 h-7 text-xs" : isLg ? "w-10 h-10 text-xl" : "w-8 h-8 text-sm";
  const textSize = isSm ? "text-sm" : isLg ? "text-xl" : "text-base";

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      <div className={`${boxSize} rounded bg-gradient-to-br from-[#0284c7] via-[#2563eb] to-[#1d4ed8] text-white font-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-white"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className={`${textSize} font-bold tracking-tight ${textColor} font-sans`}>
        LUKAS <span className="text-[#2563eb]">FINANCIAL</span>
      </span>
    </Link>
  );
}
