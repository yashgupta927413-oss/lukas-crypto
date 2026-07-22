import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserWallets,
  transferBetweenHoldingAndPersonal,
  requestDeposit,
  requestWithdrawal,
} from "@/services/walletService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const wallets = await getUserWallets(userId);
    return NextResponse.json(wallets);
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
    const { action, amount, direction } = body;

    if (action === "TRANSFER") {
      const result = await transferBetweenHoldingAndPersonal(userId, Number(amount), direction);
      return NextResponse.json(result);
    } else if (action === "DEPOSIT") {
      const result = await requestDeposit(userId, Number(amount));
      return NextResponse.json(result);
    } else if (action === "WITHDRAWAL") {
      const result = await requestWithdrawal(userId, Number(amount));
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
