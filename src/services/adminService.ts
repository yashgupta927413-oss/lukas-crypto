import { prisma } from "@/lib/prisma";
import { sendDepositConfirmedEmail, sendWithdrawalProcessedEmail } from "@/services/emailService";

export async function updateGlobalConfigData(data: {
  trialCreditAmount?: number;
  minBotDeposit?: number;
  maxBotDeposit?: number;
  binaryOptionWinRate?: number;
  referralBonusPercent?: number;
}) {
  return await prisma.globalConfig.upsert({
    where: { id: "default" },
    update: data,
    create: {
      id: "default",
      trialCreditAmount: data.trialCreditAmount ?? 100,
      minBotDeposit: data.minBotDeposit ?? 500,
      maxBotDeposit: data.maxBotDeposit ?? 10000,
      binaryOptionWinRate: data.binaryOptionWinRate ?? 75,
      referralBonusPercent: data.referralBonusPercent ?? 5,
    },
  });
}

export async function updateSmtpConfig(data: {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpEnabled: boolean;
}) {
  return await prisma.globalConfig.upsert({
    where: { id: "default" },
    update: {
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUser: data.smtpUser,
      smtpPass: data.smtpPass,
      smtpFromEmail: data.smtpFromEmail,
      smtpFromName: data.smtpFromName,
      smtpEnabled: data.smtpEnabled,
    },
    create: {
      id: "default",
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUser: data.smtpUser,
      smtpPass: data.smtpPass,
      smtpFromEmail: data.smtpFromEmail,
      smtpFromName: data.smtpFromName,
      smtpEnabled: data.smtpEnabled,
    },
  });
}

export async function updateGatewayConfig(data: {
  nowpaymentsApiKey: string;
  nowpaymentsIpnSecret: string;
  paymentGatewayEnabled: boolean;
}) {
  return await prisma.globalConfig.upsert({
    where: { id: "default" },
    update: {
      nowpaymentsApiKey: data.nowpaymentsApiKey,
      nowpaymentsIpnSecret: data.nowpaymentsIpnSecret,
      paymentGatewayEnabled: data.paymentGatewayEnabled,
    },
    create: {
      id: "default",
      nowpaymentsApiKey: data.nowpaymentsApiKey,
      nowpaymentsIpnSecret: data.nowpaymentsIpnSecret,
      paymentGatewayEnabled: data.paymentGatewayEnabled,
    },
  });
}


export async function createBotTierData(data: {
  name: string;
  durationDays: number;
  minRoiPercent: number;
  minDeposit: number;
  maxDeposit: number;
}) {
  return await prisma.botTier.create({
    data: {
      name: data.name,
      durationDays: data.durationDays,
      minRoiPercent: data.minRoiPercent,
      minDeposit: data.minDeposit,
      maxDeposit: data.maxDeposit,
      isActive: true,
    },
  });
}

export async function updateBotTierData(
  id: string,
  data: {
    name?: string;
    durationDays?: number;
    minRoiPercent?: number;
    minDeposit?: number;
    maxDeposit?: number;
    isActive?: boolean;
  }
) {
  return await prisma.botTier.update({
    where: { id },
    data,
  });
}

export async function deleteBotTierData(id: string) {
  return await prisma.botTier.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function getAllUsersWithWallets() {
  const users = await prisma.user.findMany({
    include: {
      wallets: true,
      botContracts: true,
      optionTrades: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    referralCode: u.referralCode,
    createdAt: u.createdAt,
    wallets: u.wallets
      ? {
          holdingBalance: Number(u.wallets.holdingBalance),
          botBalance: Number(u.wallets.botBalance),
          personalTradingBalance: Number(u.wallets.personalTradingBalance),
        }
      : { holdingBalance: 0, botBalance: 0, personalTradingBalance: 0 },
    activeBotsCount: u.botContracts.filter((b) => b.status === "ACTIVE").length,
    tradesCount: u.optionTrades.length,
  }));
}

export async function adminAdjustWalletBalance(
  userId: string,
  walletType: "HOLDING" | "BOT" | "PERSONAL",
  newBalance: number
) {
  if (newBalance < 0) throw new Error("Balance cannot be negative");

  const updateData: any = {};
  if (walletType === "HOLDING") updateData.holdingBalance = newBalance;
  if (walletType === "BOT") updateData.botBalance = newBalance;
  if (walletType === "PERSONAL") updateData.personalTradingBalance = newBalance;

  await prisma.wallet.update({
    where: { userId },
    data: updateData,
  });

  await prisma.transaction.create({
    data: {
      userId,
      type: "ADMIN_ADJUSTMENT",
      amount: newBalance,
      toWallet: walletType,
      status: "COMPLETED",
    },
  });

  return { success: true };
}

export async function getPendingTransactions() {
  const transactions = await prisma.transaction.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return transactions.map((t) => ({
    id: t.id,
    userId: t.userId,
    userEmail: t.user.email,
    type: t.type,
    amount: Number(t.amount),
    fromWallet: t.fromWallet,
    toWallet: t.toWallet,
    status: t.status,
    createdAt: t.createdAt,
  }));
}

export async function processTransactionApproval(transactionId: string, action: "APPROVE" | "REJECT") {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { user: { select: { email: true } } },
    });

    if (!transaction || transaction.status !== "PENDING") {
      throw new Error("Transaction not found or already processed");
    }

    if (action === "APPROVE") {
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      });

      if (transaction.type === "DEPOSIT") {
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: { holdingBalance: { increment: transaction.amount } },
        });
        // Send deposit confirmed email (non-blocking)
        sendDepositConfirmedEmail(transaction.user.email, Number(transaction.amount).toFixed(2)).catch(() => {});
      }
    } else {
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "REJECTED" },
      });

      if (transaction.type === "WITHDRAWAL") {
        // Refund holding balance on rejection
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: { holdingBalance: { increment: transaction.amount } },
        });
      }
    }

    // Send withdrawal notification email (non-blocking)
    if (transaction.type === "WITHDRAWAL") {
      const status = action === "APPROVE" ? "COMPLETED" : "REJECTED";
      sendWithdrawalProcessedEmail(transaction.user.email, Number(transaction.amount).toFixed(2), status).catch(() => {});
    }

    return { success: true };
  });
}
