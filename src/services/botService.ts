import { prisma } from "@/lib/prisma";

export async function getBotTiers() {
  const tiers = await prisma.botTier.findMany({
    where: { isActive: true },
    orderBy: { durationDays: "asc" },
  });

  return tiers.map((t) => ({
    ...t,
    minRoiPercent: Number(t.minRoiPercent),
    minDeposit: Number(t.minDeposit),
    maxDeposit: Number(t.maxDeposit),
  }));
}

export async function getGlobalConfig() {
  let config = await prisma.globalConfig.findUnique({
    where: { id: "default" },
  });

  if (!config) {
    config = await prisma.globalConfig.create({
      data: {
        id: "default",
        trialCreditAmount: 100,
        minBotDeposit: 500,
        maxBotDeposit: 10000,
        binaryOptionWinRate: 75,
        referralBonusPercent: 5,
      },
    });
  }

  return {
    trialCreditAmount: Number(config.trialCreditAmount),
    minBotDeposit: Number(config.minBotDeposit),
    maxBotDeposit: Number(config.maxBotDeposit),
    binaryOptionWinRate: Number(config.binaryOptionWinRate),
    referralBonusPercent: Number(config.referralBonusPercent),
  };
}

export async function getUserBotContracts(userId: string) {
  const contracts = await prisma.botContract.findMany({
    where: { userId },
    include: {
      tier: true,
      yieldLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return contracts.map((c) => ({
    id: c.id,
    tierName: c.tier.name,
    durationDays: c.tier.durationDays,
    principal: Number(c.principal),
    trialBonusUsed: Number(c.trialBonusUsed),
    accumulatedProfit: Number(c.accumulatedProfit),
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    yieldLogs: c.yieldLogs.map((y) => ({
      id: y.id,
      yieldPercent: Number(y.yieldPercent),
      profitAmount: Number(y.profitAmount),
      createdAt: y.createdAt,
    })),
  }));
}

export async function activateBotContract(
  userId: string,
  tierId: string,
  topUpAmount: number,
  useTrialCredit: boolean
) {
  const config = await getGlobalConfig();
  const tier = await prisma.botTier.findUnique({ where: { id: tierId } });

  if (!tier || !tier.isActive) {
    throw new Error("Invalid or inactive Bot Tier selected");
  }

  // Check if trial credit is requested and available
  let trialAmountToUse = 0;
  if (useTrialCredit) {
    const existingContractWithTrial = await prisma.botContract.findFirst({
      where: { userId, trialBonusUsed: { gt: 0 } },
    });

    if (existingContractWithTrial) {
      throw new Error("You have already redeemed your $100 Free Trial Credit on a previous contract");
    }

    trialAmountToUse = config.trialCreditAmount;
  }

  const totalPrincipal = topUpAmount + trialAmountToUse;
  const minRequiredDeposit = Number(tier.minDeposit);
  const maxAllowedDeposit = Number(tier.maxDeposit);

  if (totalPrincipal < minRequiredDeposit) {
    throw new Error(
      `Total Bot Principal ($${totalPrincipal.toFixed(
        2
      )}) must meet the tier minimum deposit of $${minRequiredDeposit}`
    );
  }

  if (totalPrincipal > maxAllowedDeposit) {
    throw new Error(
      `Total Bot Principal ($${totalPrincipal.toFixed(
        2
      )}) exceeds the tier maximum deposit of $${maxAllowedDeposit}`
    );
  }

  if (topUpAmount < 400 && trialAmountToUse > 0) {
    throw new Error("A minimum top-up of $400 from your Holding Wallet is required to activate the bot with the trial credit.");
  }

  return await prisma.$transaction(async (tx) => {
    // Check holding wallet balance
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.holdingBalance) < topUpAmount) {
      throw new Error(
        `Insufficient Holding Wallet balance. Available: $${Number(
          wallet?.holdingBalance || 0
        ).toFixed(2)}, Required top-up: $${topUpAmount.toFixed(2)}`
      );
    }

    // Deduct topUpAmount from Holding Wallet & add totalPrincipal to botBalance
    await tx.wallet.update({
      where: { userId },
      data: {
        holdingBalance: { decrement: topUpAmount },
        botBalance: { increment: totalPrincipal },
      },
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + tier.durationDays * 24 * 60 * 60 * 1000);

    const contract = await tx.botContract.create({
      data: {
        userId,
        tierId: tier.id,
        principal: totalPrincipal,
        trialBonusUsed: trialAmountToUse,
        accumulatedProfit: 0,
        status: "ACTIVE",
        startDate,
        endDate,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: "BOT_ACTIVATION",
        amount: topUpAmount,
        fromWallet: "HOLDING",
        toWallet: "BOT",
        status: "COMPLETED",
      },
    });

    return contract;
  });
}

export async function injectDailyYield(tierId: string, yieldPercent: number) {
  if (yieldPercent <= 0) {
    throw new Error("Yield percentage must be greater than zero");
  }

  const activeContracts = await prisma.botContract.findMany({
    where: {
      tierId,
      status: "ACTIVE",
    },
  });

  if (activeContracts.length === 0) {
    return { affectedContracts: 0, totalProfitDistributed: 0 };
  }

  let totalProfitDistributed = 0;

  await prisma.$transaction(async (tx) => {
    for (const contract of activeContracts) {
      const principal = Number(contract.principal);
      const profitAmount = (principal * yieldPercent) / 100;
      totalProfitDistributed += profitAmount;

      await tx.botContract.update({
        where: { id: contract.id },
        data: {
          accumulatedProfit: { increment: profitAmount },
        },
      });

      await tx.botYieldLog.create({
        data: {
          contractId: contract.id,
          yieldPercent,
          profitAmount,
        },
      });
    }
  });

  return {
    affectedContracts: activeContracts.length,
    totalProfitDistributed,
  };
}

export async function releaseBotContractToHolding(userId: string, contractId: string) {
  return await prisma.$transaction(async (tx) => {
    const contract = await tx.botContract.findUnique({
      where: { id: contractId },
    });

    if (!contract || contract.userId !== userId) {
      throw new Error("Bot Contract not found");
    }

    const now = new Date();
    if (now < contract.endDate && contract.status === "ACTIVE") {
      throw new Error(
        `Contract lock period active until ${contract.endDate.toISOString().split("T")[0]}. Cannot release funds early.`
      );
    }

    if (contract.status === "COMPLETED" || contract.status === "CANCELLED") {
      throw new Error("This contract funds have already been claimed or released.");
    }

    const totalReleaseAmount = Number(contract.principal) + Number(contract.accumulatedProfit);

    // Update contract status
    await tx.botContract.update({
      where: { id: contractId },
      data: { status: "COMPLETED" },
    });

    // Move funds from Bot Balance to Holding Balance
    await tx.wallet.update({
      where: { userId },
      data: {
        botBalance: { decrement: Number(contract.principal) },
        holdingBalance: { increment: totalReleaseAmount },
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: "BOT_RELEASE",
        amount: totalReleaseAmount,
        fromWallet: "BOT",
        toWallet: "HOLDING",
        status: "COMPLETED",
      },
    });

    return { totalReleaseAmount };
  });
}
