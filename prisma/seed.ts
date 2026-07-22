import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Global Configuration
  const config = await prisma.globalConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      trialCreditAmount: 100,
      minBotDeposit: 500,
      maxBotDeposit: 10000,
      binaryOptionWinRate: 75,
      referralBonusPercent: 5,
    },
  });
  console.log("GlobalConfig seeded:", config.id);

  // 2. Bot Tiers
  const tiers = [
    {
      name: "1 Month Growth Bot",
      durationDays: 30,
      minRoiPercent: 15,
      minDeposit: 500,
      maxDeposit: 10000,
    },
    {
      name: "3 Month Yield Maximizer",
      durationDays: 90,
      minRoiPercent: 55,
      minDeposit: 500,
      maxDeposit: 25000,
    },
    {
      name: "6 Month Pro Institutional",
      durationDays: 180,
      minRoiPercent: 130,
      minDeposit: 1000,
      maxDeposit: 50000,
    },
    {
      name: "1 Year Elite AI Strategy",
      durationDays: 365,
      minRoiPercent: 320,
      minDeposit: 2500,
      maxDeposit: 100000,
    },
  ];

  for (const tierData of tiers) {
    const existing = await prisma.botTier.findFirst({
      where: { name: tierData.name },
    });
    if (!existing) {
      await prisma.botTier.create({ data: tierData });
    }
  }
  console.log("Bot Tiers seeded");

  // 3. Admin Account
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@crypto.com" },
    update: {},
    create: {
      email: "admin@crypto.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      referralCode: "ADMIN001",
      wallets: {
        create: {
          holdingBalance: 50000,
          botBalance: 0,
          personalTradingBalance: 10000,
        },
      },
    },
  });
  console.log("Admin user seeded:", admin.email);

  // 4. Regular Demo User Account
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@crypto.com" },
    update: {},
    create: {
      email: "user@crypto.com",
      passwordHash: userPassword,
      role: "USER",
      referralCode: "CRYPTO777",
      wallets: {
        create: {
          holdingBalance: 1250.0,
          botBalance: 500.0,
          personalTradingBalance: 450.0,
        },
      },
    },
    include: { wallets: true },
  });
  console.log("Demo user seeded:", user.email);

  // 5. Active Bot Contract for Demo User
  const tier1 = await prisma.botTier.findFirst({ where: { durationDays: 30 } });
  if (tier1) {
    const existingContract = await prisma.botContract.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    });

    if (!existingContract) {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const contract = await prisma.botContract.create({
        data: {
          userId: user.id,
          tierId: tier1.id,
          principal: 500.0,
          trialBonusUsed: 100.0,
          accumulatedProfit: 37.5,
          status: "ACTIVE",
          startDate,
          endDate,
          yieldLogs: {
            create: [
              { yieldPercent: 2.5, profitAmount: 12.5 },
              { yieldPercent: 2.5, profitAmount: 12.5 },
              { yieldPercent: 2.5, profitAmount: 12.5 },
            ],
          },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "BOT_ACTIVATION",
          amount: 400.0,
          fromWallet: "HOLDING",
          toWallet: "BOT",
          status: "COMPLETED",
        },
      });

      console.log("Demo Bot Contract created:", contract.id);
    }
  }

  // 6. Sample Option Trades
  const existingTrade = await prisma.optionTrade.findFirst({
    where: { userId: user.id },
  });

  if (!existingTrade) {
    const now = Date.now();
    await prisma.optionTrade.createMany({
      data: [
        {
          userId: user.id,
          symbol: "BTCUSDT",
          direction: "CALL",
          stakeAmount: 50,
          payoutMultiplier: 1.75,
          strikePrice: 94250.0,
          settlementPrice: 94800.0,
          status: "WIN",
          expiryTimeframe: "5m",
          expiresAt: new Date(now - 1000 * 60 * 10),
          createdAt: new Date(now - 1000 * 60 * 15),
        },
        {
          userId: user.id,
          symbol: "ETHUSDT",
          direction: "PUT",
          stakeAmount: 100,
          payoutMultiplier: 1.75,
          strikePrice: 2750.0,
          settlementPrice: 2780.0,
          status: "LOSS",
          expiryTimeframe: "15m",
          expiresAt: new Date(now - 1000 * 60 * 5),
          createdAt: new Date(now - 1000 * 60 * 20),
        },
        {
          userId: user.id,
          symbol: "SOLUSDT",
          direction: "CALL",
          stakeAmount: 75,
          payoutMultiplier: 1.75,
          strikePrice: 195.5,
          settlementPrice: null,
          status: "PENDING",
          expiryTimeframe: "5m",
          expiresAt: new Date(now + 1000 * 60 * 3),
          createdAt: new Date(now - 1000 * 60 * 2),
        },
      ],
    });
    console.log("Sample Option Trades seeded");
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
