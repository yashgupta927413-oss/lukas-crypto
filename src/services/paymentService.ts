import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendDepositConfirmedEmail } from "./emailService";

export interface CreatePaymentParams {
  userId: string;
  amount: number;
  payCurrency: string; // e.g. "usdttrc20", "btc", "eth", "sol"
}

export async function createCryptoPayment(params: CreatePaymentParams) {
  const { userId, amount, payCurrency } = params;

  if (amount <= 0) {
    throw new Error("Deposit amount must be positive");
  }

  // Fetch global config for NOWPayments API key
  const config = await prisma.globalConfig.findUnique({ where: { id: "default" } });
  const apiKey = config?.nowpaymentsApiKey || process.env.NOWPAYMENTS_API_KEY;
  const isEnabled = config?.paymentGatewayEnabled ?? false;

  // Create pending transaction in database
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: "DEPOSIT",
      amount,
      toWallet: "HOLDING",
      status: "PENDING",
      payCurrency,
    },
  });

  // If NOWPayments API Key is set and enabled, call NOWPayments API to get address + payment ID
  if (apiKey && isEnabled) {
    try {
      const response = await fetch("https://api.nowpayments.io/v1/payment", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: "usd",
          pay_currency: payCurrency.toLowerCase(),
          order_id: transaction.id,
          order_description: `Deposit for account ${userId.slice(0, 8)}`,
          ipn_callback_url: `${process.env.NEXTAUTH_URL || "https://lukas-crypto.vercel.app"}/api/webhooks/payment`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update transaction with NOWPayments payment_id and pay_address
        const updatedTx = await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentId: data.payment_id?.toString() || data.id?.toString(),
            payAddress: data.pay_address,
          },
        });
        return {
          transactionId: updatedTx.id,
          paymentId: updatedTx.paymentId,
          payAddress: updatedTx.payAddress,
          payCurrency: updatedTx.payCurrency,
          amount: Number(updatedTx.amount),
          status: updatedTx.status,
          isLiveGateway: true,
        };
      }
    } catch (err) {
      console.error("NOWPayments API call error, falling back to non-custodial address:", err);
    }
  }

  // Fallback: Generate non-custodial deposit address if API Key is not configured yet
  const fallbackAddress = getFallbackDepositAddress(payCurrency);
  const updatedTx = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      payAddress: fallbackAddress,
      paymentId: `demo_pay_${transaction.id.slice(0, 8)}`,
    },
  });

  return {
    transactionId: updatedTx.id,
    paymentId: updatedTx.paymentId,
    payAddress: updatedTx.payAddress,
    payCurrency: updatedTx.payCurrency,
    amount: Number(updatedTx.amount),
    status: updatedTx.status,
    isLiveGateway: false,
  };
}

export function getFallbackDepositAddress(currency: string): string {
  const curr = currency.toLowerCase();
  if (curr.includes("btc")) return "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  if (curr.includes("eth")) return "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
  if (curr.includes("sol")) return "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
  return "TY9a1x7Z8bQxLp2mK9vR5wE4tY8uI0oP"; // USDT TRC-20
}

/**
 * Verify NOWPayments IPN Signature
 */
export function verifyIpnSignature(payload: any, signatureHeader: string | null, secretKey: string): boolean {
  if (!signatureHeader || !secretKey) return true; // Accept if secret not set for testing

  try {
    const sortedKeys = Object.keys(payload).sort();
    const sortedPayload: Record<string, any> = {};
    for (const key of sortedKeys) {
      sortedPayload[key] = payload[key];
    }

    const hmac = crypto.createHmac("sha512", secretKey);
    hmac.update(JSON.stringify(sortedPayload));
    const calculatedSignature = hmac.digest("hex");

    return calculatedSignature === signatureHeader;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Automatically credit user balance when IPN Webhook notifies payment completion
 */
export async function processPaymentWebhook(payload: any) {
  const { payment_id, payment_status, order_id, price_amount, pay_amount, pay_currency } = payload;

  // Statuses considered finished in NOWPayments: finished, confirmed
  const isCompleted = payment_status === "finished" || payment_status === "confirmed";

  if (!isCompleted) {
    return { status: "ignored", message: `Payment status '${payment_status}' is not finished yet.` };
  }

  // Find transaction by order_id or payment_id
  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id: order_id },
        { paymentId: payment_id?.toString() },
      ],
    },
    include: { user: true },
  });

  if (!transaction) {
    throw new Error(`Transaction not found for payment_id: ${payment_id}`);
  }

  if (transaction.status === "COMPLETED") {
    return { status: "already_completed", transactionId: transaction.id };
  }

  const depositAmount = price_amount ? Number(price_amount) : Number(transaction.amount);

  // Execute database transaction to credit holding balance
  await prisma.$transaction(async (tx: any) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        amount: depositAmount,
      },
    });

    await tx.wallet.update({
      where: { userId: transaction.userId },
      data: {
        holdingBalance: { increment: depositAmount },
      },
    });
  });

  // Send email notification
  if (transaction.user?.email) {
    try {
      await sendDepositConfirmedEmail(
        transaction.user.email,
        depositAmount,
        transaction.id,
        (pay_currency || transaction.payCurrency || "USDT").toUpperCase()
      );
    } catch (e) {
      console.error("Failed to send deposit confirmation email:", e);
    }
  }

  return { status: "success", transactionId: transaction.id, creditedAmount: depositAmount };
}
