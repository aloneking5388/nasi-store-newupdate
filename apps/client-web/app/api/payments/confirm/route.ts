import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createHmac } from "crypto";
import PendingGatewayPayment from "@/models/PendingGatewayPayment";
import { connectDB } from "@/utils/ConnectDB";
import { settleOrderPayment } from "@/lib/paymentSettlement";
import { checkPaymentStatus, getAccessToken } from "@/lib/momo";

type ConfirmPayload = {
  pendingPaymentId: string;
  gateway: "momopay" | "stripe" | "paypal" | "razorpay" | "gpay";
  sessionId?: string;
  paypalOrderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured yet.");
  }

  const base =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenResponse = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw new Error("Unable to authenticate PayPal");
  }

  const tokenData = await tokenResponse.json();
  return { accessToken: tokenData.access_token as string, base };
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      pendingPaymentId,
      gateway,
      sessionId,
      paypalOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = (await req.json()) as ConfirmPayload;

    if (!pendingPaymentId || !gateway) {
      return NextResponse.json(
        {
          success: false,
          message: "pendingPaymentId and gateway are required",
        },
        { status: 400 },
      );
    }

    const pendingPayment =
      await PendingGatewayPayment.findById(pendingPaymentId);
    if (!pendingPayment) {
      return NextResponse.json(
        { success: false, message: "Pending payment not found" },
        { status: 404 },
      );
    }

    if (pendingPayment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already confirmed",
      });
    }

    if (pendingPayment.expiresAt < new Date()) {
      pendingPayment.status = "failed";
      await pendingPayment.save();
      return NextResponse.json(
        { success: false, message: "Payment session expired" },
        { status: 410 },
      );
    }

    if (pendingPayment.method !== gateway) {
      return NextResponse.json(
        { success: false, message: "Gateway does not match pending payment" },
        { status: 400 },
      );
    }

    let providerReference = pendingPayment.providerReference || undefined;

    if (gateway === "momopay") {
      const token = await getAccessToken();
      const status = await checkPaymentStatus(
        pendingPayment.providerReference || "",
        token,
      );

      if (status.status === "PENDING") {
        return NextResponse.json(
          {
            success: false,
            pending: true,
            message: "Payment is still pending approval",
          },
          { status: 202 },
        );
      }

      if (status.status !== "SUCCESSFUL") {
        pendingPayment.status = "failed";
        await pendingPayment.save();
        return NextResponse.json(
          { success: false, message: "MoMo payment was not successful" },
          { status: 400 },
        );
      }
    }

    if (gateway === "stripe") {
      if (!sessionId || sessionId !== pendingPayment.providerSessionId) {
        return NextResponse.json(
          { success: false, message: "Invalid Stripe session" },
          { status: 400 },
        );
      }

      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        throw new Error("Stripe is not configured yet.");
      }

      const stripe = new Stripe(stripeSecret);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return NextResponse.json(
          {
            success: false,
            pending: true,
            message: "Stripe payment is not marked paid yet",
          },
          { status: 202 },
        );
      }

      providerReference = session.payment_intent?.toString() || session.id;
      pendingPayment.providerPaymentId = providerReference;
    }

    if (gateway === "paypal") {
      if (!paypalOrderId || paypalOrderId !== pendingPayment.providerOrderId) {
        return NextResponse.json(
          { success: false, message: "Invalid PayPal order reference" },
          { status: 400 },
        );
      }

      const { accessToken, base } = await getPayPalAccessToken();
      const captureResponse = await fetch(
        `${base}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (!captureResponse.ok) {
        const details = await captureResponse.text();
        throw new Error(`Unable to capture PayPal order: ${details}`);
      }

      const captureData = await captureResponse.json();
      if (captureData.status !== "COMPLETED") {
        return NextResponse.json(
          {
            success: false,
            pending: true,
            message: "PayPal payment is not completed yet",
          },
          { status: 202 },
        );
      }

      providerReference = captureData.id;
      pendingPayment.providerPaymentId = captureData.id;
    }

    if (gateway === "razorpay" || gateway === "gpay") {
      if (
        !razorpayOrderId ||
        !razorpayPaymentId ||
        !razorpaySignature ||
        razorpayOrderId !== pendingPayment.providerOrderId
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid Razorpay payment response" },
          { status: 400 },
        );
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        throw new Error("Razorpay is not configured yet.");
      }

      const expectedSignature = createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        pendingPayment.status = "failed";
        await pendingPayment.save();
        return NextResponse.json(
          { success: false, message: "Invalid Razorpay signature" },
          { status: 400 },
        );
      }

      providerReference = razorpayPaymentId;
      pendingPayment.providerPaymentId = razorpayPaymentId;
    }

    const result = await settleOrderPayment({
      orderId: pendingPayment.orderId.toString(),
      walletAmount: pendingPayment.walletAmount,
      source: gateway,
      providerReference,
    });

    pendingPayment.status = "paid";
    await pendingPayment.save();

    return NextResponse.json({
      success: true,
      message: result.message,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to confirm payment",
      },
      { status: 500 },
    );
  }
}
