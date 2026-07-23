import { prisma } from "@/lib/prisma";
import { getGlobalConfig } from "./botService";

export async function getUserOptionTrades(userId: string) {
  const trades = await prisma.optionTrade.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return trades.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    direction: t.direction,
    stakeAmount: Number(t.stakeAmount),
    payoutMultiplier: Number(t.payoutMultiplier),
    strikePrice: Number(t.strikePrice),
    settlementPrice: t.settlementPrice ? Number(t.settlementPrice) : null,
    status: t.status,
    expiryTimeframe: t.expiryTimeframe,
    expiresAt: t.expiresAt,
    createdAt: t.createdAt,
  }));
}

export async function getAllOptionTrades() {
  const trades = await prisma.optionTrade.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return trades.map((t) => ({
    id: t.id,
    userEmail: t.user.email,
    symbol: t.symbol,
    direction: t.direction,
    stakeAmount: Number(t.stakeAmount),
    payoutMultiplier: Number(t.payoutMultiplier),
    strikePrice: Number(t.strikePrice),
    settlementPrice: t.settlementPrice ? Number(t.settlementPrice) : null,
    status: t.status,
    expiryTimeframe: t.expiryTimeframe,
    expiresAt: t.expiresAt,
    createdAt: t.createdAt,
  }));
}

export async function createOptionTrade(
  userId: string,
  symbol: string,
  direction: "CALL" | "PUT",
  stakeAmount: number,
  expiryTimeframe: string,
  strikePrice: number
) {
  if (stakeAmount <= 0) {
    throw new Error("Stake amount must be greater than zero");
  }

  if (!strikePrice || isNaN(strikePrice) || strikePrice <= 0) {
    throw new Error("Invalid strike price");
  }

  const config = await getGlobalConfig();
  const payoutMultiplier = 1 + config.binaryOptionWinRate / 100;

  // Calculate expiry time based on timeframe
  const now = new Date();
  let durationMs = 5 * 60 * 1000; // default 5m
  if (expiryTimeframe === "1m") durationMs = 1 * 60 * 1000;
  else if (expiryTimeframe === "15m") durationMs = 15 * 60 * 1000;
  else if (expiryTimeframe === "30m") durationMs = 30 * 60 * 1000;
  else if (expiryTimeframe === "1h") durationMs = 60 * 60 * 1000;
  else if (expiryTimeframe === "4h") durationMs = 4 * 60 * 60 * 1000;
  else if (expiryTimeframe === "daily") {
    // End of current UTC day
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(23, 59, 59, 999);
    durationMs = tomorrow.getTime() - now.getTime();
  }

  const expiresAt = new Date(now.getTime() + durationMs);

  return await prisma.$transaction(async (tx) => {
    // Check personal trading balance
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.personalTradingBalance) < stakeAmount) {
      throw new Error(
        `Insufficient Personal Trading Wallet balance ($${Number(
          wallet?.personalTradingBalance || 0
        ).toFixed(2)})`
      );
    }

    // Deduct stake amount from Personal Trading Wallet
    await tx.wallet.update({
      where: { userId },
      data: {
        personalTradingBalance: { decrement: stakeAmount },
      },
    });

    const trade = await tx.optionTrade.create({
      data: {
        userId,
        symbol,
        direction,
        stakeAmount,
        payoutMultiplier,
        strikePrice,
        status: "PENDING",
        expiryTimeframe,
        expiresAt,
      },
    });

    return {
      id: trade.id,
      symbol: trade.symbol,
      direction: trade.direction,
      stakeAmount: Number(trade.stakeAmount),
      payoutMultiplier: Number(trade.payoutMultiplier),
      strikePrice: Number(trade.strikePrice),
      status: trade.status,
      expiresAt: trade.expiresAt,
    };
  });
}

export async function settleTrade(tradeId: string, settlementPrice: number) {
  return await prisma.$transaction(async (tx) => {
    const trade = await tx.optionTrade.findUnique({ where: { id: tradeId } });
    if (!trade || trade.status !== "PENDING") {
      return null;
    }

    const strike = Number(trade.strikePrice);
    const stake = Number(trade.stakeAmount);
    const multiplier = Number(trade.payoutMultiplier);

    let status: "WIN" | "LOSS" | "DRAW" = "LOSS";

    if (trade.direction === "CALL") {
      if (settlementPrice > strike) status = "WIN";
      else if (settlementPrice === strike) status = "DRAW";
      else status = "LOSS";
    } else {
      if (settlementPrice < strike) status = "WIN";
      else if (settlementPrice === strike) status = "DRAW";
      else status = "LOSS";
    }

    if (status === "WIN") {
      const winPayout = stake * multiplier;
      await tx.wallet.update({
        where: { userId: trade.userId },
        data: {
          personalTradingBalance: { increment: winPayout },
        },
      });
    } else if (status === "DRAW") {
      await tx.wallet.update({
        where: { userId: trade.userId },
        data: {
          personalTradingBalance: { increment: stake },
        },
      });
    }

    const updated = await tx.optionTrade.update({
      where: { id: tradeId },
      data: {
        settlementPrice,
        status,
      },
    });

    return updated;
  });
}

export async function autoSettleExpiredTrades(symbolPrices: Record<string, number>) {
  const expiredTrades = await prisma.optionTrade.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lte: new Date() },
    },
  });

  const settled = [];

  for (const trade of expiredTrades) {
    const livePrice = symbolPrices[trade.symbol];
    if (livePrice && livePrice > 0) {
      const result = await settleTrade(trade.id, livePrice);
      if (result) settled.push(result);
    }
  }

  return settled;
}
