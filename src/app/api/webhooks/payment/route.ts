import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyIpnSignature, processPaymentWebhook } from "@/services/paymentService";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    const signature = req.headers.get("x-nowpayments-sig");

    const config = await prisma.globalConfig.findUnique({ where: { id: "default" } });
    const ipnSecret = config?.nowpaymentsIpnSecret || process.env.NOWPAYMENTS_IPN_SECRET || "";

    // Verify signature if secret configured
    if (ipnSecret && !verifyIpnSignature(payload, signature, ipnSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const result = await processPaymentWebhook(payload);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 500 });
  }
}
