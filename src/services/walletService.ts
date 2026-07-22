import { prisma } from "@/lib/prisma";

export async function getUserWallets(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        holdingBalance: 0,
        botBalance: 0,
        personalTradingBalance: 0,
      },
    });
  }

  return {
    holdingBalance: Number(wallet.holdingBalance),
    botBalance: Number(wallet.botBalance),
    personalTradingBalance: Number(wallet.personalTradingBalance),
    updatedAt: wallet.updatedAt,
  };
}

export async function transferBetweenHoldingAndPersonal(
  userId: string,
  amount: number,
  direction: "HOLDING_TO_PERSONAL" | "PERSONAL_TO_HOLDING"
) {
  if (amount <= 0) {
    throw new Error("Transfer amount must be greater than zero");
  }

  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("Wallet not found");

    const holding = Number(wallet.holdingBalance);
    const personal = Number(wallet.personalTradingBalance);

    if (direction === "HOLDING_TO_PERSONAL") {
      if (holding < amount) {
        throw new Error(`Insufficient Holding Wallet balance. Available: $${holding.toFixed(2)}`);
      }
      await tx.wallet.update({
        where: { userId },
        data: {
          holdingBalance: { decrement: amount },
          personalTradingBalance: { increment: amount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "WALLET_TRANSFER",
          amount,
          fromWallet: "HOLDING",
          toWallet: "PERSONAL",
          status: "COMPLETED",
        },
      });
    } else {
      if (personal < amount) {
        throw new Error(`Insufficient Personal Trading Wallet balance. Available: $${personal.toFixed(2)}`);
      }
      await tx.wallet.update({
        where: { userId },
        data: {
          personalTradingBalance: { decrement: amount },
          holdingBalance: { increment: amount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "WALLET_TRANSFER",
          amount,
          fromWallet: "PERSONAL",
          toWallet: "HOLDING",
          status: "COMPLETED",
        },
      });
    }

    return { success: true };
  });
}

export async function requestDeposit(userId: string, amount: number) {
  if (amount <= 0) throw new Error("Deposit amount must be positive");
  
  // Instant credited or pending approval
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: "DEPOSIT",
        amount,
        toWallet: "HOLDING",
        status: "COMPLETED", // Instant demo deposit
      },
    });

    await tx.wallet.update({
      where: { userId },
      data: {
        holdingBalance: { increment: amount },
      },
    });

    return transaction;
  });
}

export async function requestWithdrawal(userId: string, amount: number) {
  if (amount <= 0) throw new Error("Withdrawal amount must be positive");

  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.holdingBalance) < amount) {
      throw new Error("Insufficient Holding Wallet balance for withdrawal request");
    }

    // Deduct holding balance immediately for pending withdrawal request
    await tx.wallet.update({
      where: { userId },
      data: {
        holdingBalance: { decrement: amount },
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        type: "WITHDRAWAL",
        amount,
        fromWallet: "HOLDING",
        status: "PENDING",
      },
    });

    return transaction;
  });
}
