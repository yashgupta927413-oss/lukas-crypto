import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getUserOptionTrades,
  createOptionTrade,
  settleTrade,
} from "@/services/optionsService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const trades = await getUserOptionTrades(userId);
    return NextResponse.json({ trades });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const body = await req.json();
    const { symbol, direction, stakeAmount, expiryTimeframe, strikePrice } = body;

    let parsedStrike = Number(strikePrice);
    if (isNaN(parsedStrike) || parsedStrike <= 0) {
      try {
        const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          parsedStrike = parseFloat(priceData.price);
        }
      } catch (e) {
        console.error("Binance price lookup fallback failed", e);
      }
    }

    if (isNaN(parsedStrike) || parsedStrike <= 0) {
      return NextResponse.json({ error: "Invalid strike price" }, { status: 400 });
    }

    const trade = await createOptionTrade(
      userId,
      symbol,
      direction,
      Number(stakeAmount),
      expiryTimeframe,
      parsedStrike
    );

    return NextResponse.json(trade);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { tradeId } = body;

    if (tradeId) {
      const trade = await prisma.optionTrade.findUnique({ where: { id: tradeId } });
      if (!trade || trade.status !== "PENDING") {
        return NextResponse.json({ error: "Trade not found or already settled" }, { status: 400 });
      }

      // ALWAYS fetch the exact Binance spot price for trade.symbol (e.g. BTCUSDT) directly from Binance
      let livePrice = 0;
      try {
        const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${trade.symbol}`);
        if (priceRes.ok) {
          const data = await priceRes.json();
          livePrice = parseFloat(data.price);
        }
      } catch (e) {
        console.error(`Binance price fetch error for ${trade.symbol}`, e);
      }

      if (!livePrice || livePrice <= 0) {
        return NextResponse.json({ error: `Could not fetch spot price for ${trade.symbol}` }, { status: 400 });
      }

      const settled = await settleTrade(tradeId, livePrice);
      return NextResponse.json({ settled });
    }

    // Auto-settle all pending expired trades for session user
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const userId = (session.user as any).id;
      const trades = await getUserOptionTrades(userId);
      return NextResponse.json({ trades });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
