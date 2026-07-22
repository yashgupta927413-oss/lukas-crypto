import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  updateGlobalConfigData,
  createBotTierData,
  updateBotTierData,
  deleteBotTierData,
  getAllUsersWithWallets,
  adminAdjustWalletBalance,
  getPendingTransactions,
  processTransactionApproval,
  updateSmtpConfig,
} from "@/services/adminService";
import { injectDailyYield, getBotTiers, getGlobalConfig } from "@/services/botService";
import { getAllOptionTrades } from "@/services/optionsService";
import { sendTestEmail } from "@/services/emailService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
  }

  try {
    const config = await getGlobalConfig();
    const tiers = await getBotTiers();
    const users = await getAllUsersWithWallets();
    const optionTrades = await getAllOptionTrades();
    const pendingTransactions = await getPendingTransactions();

    return NextResponse.json({
      config,
      tiers,
      users,
      optionTrades,
      pendingTransactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "UPDATE_CONFIG") {
      const result = await updateGlobalConfigData(body.data);
      return NextResponse.json(result);
    } else if (action === "CREATE_TIER") {
      const result = await createBotTierData(body.data);
      return NextResponse.json(result);
    } else if (action === "UPDATE_TIER") {
      const result = await updateBotTierData(body.tierId, body.data);
      return NextResponse.json(result);
    } else if (action === "DELETE_TIER") {
      const result = await deleteBotTierData(body.tierId);
      return NextResponse.json(result);
    } else if (action === "INJECT_YIELD") {
      const result = await injectDailyYield(body.tierId, Number(body.yieldPercent));
      return NextResponse.json(result);
    } else if (action === "ADJUST_WALLET") {
      const result = await adminAdjustWalletBalance(
        body.userId,
        body.walletType,
        Number(body.newBalance)
      );
      return NextResponse.json(result);
    } else if (action === "PROCESS_TRANSACTION") {
      const result = await processTransactionApproval(body.transactionId, body.decision);
      return NextResponse.json(result);
    } else if (action === "UPDATE_SMTP") {
      const result = await updateSmtpConfig(body.data);
      return NextResponse.json(result);
    } else if (action === "SEND_TEST_EMAIL") {
      await sendTestEmail(body.email);
      return NextResponse.json({ success: true, message: "Test email sent!" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

