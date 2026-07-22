import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getBotTiers,
  getUserBotContracts,
  activateBotContract,
  releaseBotContractToHolding,
  getGlobalConfig,
} from "@/services/botService";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  try {
    const tiers = await getBotTiers();
    const globalConfig = await getGlobalConfig();
    const contracts = userId ? await getUserBotContracts(userId) : [];

    return NextResponse.json({
      tiers,
      globalConfig,
      contracts,
    });
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
    const { action, tierId, topUpAmount, useTrialCredit, contractId } = body;

    if (action === "ACTIVATE") {
      const contract = await activateBotContract(
        userId,
        tierId,
        Number(topUpAmount),
        Boolean(useTrialCredit)
      );
      return NextResponse.json(contract);
    } else if (action === "RELEASE") {
      const result = await releaseBotContractToHolding(userId, contractId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
