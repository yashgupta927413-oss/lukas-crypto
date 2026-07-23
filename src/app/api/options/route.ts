import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserOptionTrades,
  createOptionTrade,
  autoSettleExpiredTrades,
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
    const { symbolPrices } = body; // e.g. { BTCUSDT: 95000, ETHUSDT: 2700 }

    if (!symbolPrices || typeof symbolPrices !== "object") {
      return NextResponse.json({ error: "Invalid symbolPrices" }, { status: 400 });
    }

    const settled = await autoSettleExpiredTrades(symbolPrices);
    return NextResponse.json({ settledCount: settled.length, settled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
