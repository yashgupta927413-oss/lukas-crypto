import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCryptoPayment } from "@/services/paymentService";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const body = await req.json();
    const { amount, payCurrency = "usdttrc20" } = body;

    const paymentResult = await createCryptoPayment({
      userId,
      amount: Number(amount),
      payCurrency,
    });

    return NextResponse.json(paymentResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 400 });
  }
}
