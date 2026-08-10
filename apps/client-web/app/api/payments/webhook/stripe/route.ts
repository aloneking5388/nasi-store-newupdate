import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import PendingGatewayPayment from "@/models/PendingGatewayPayment";
import { connectDB } from "@/utils/ConnectDB";
import { settleOrderPayment } from "@/lib/paymentSettlement";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const resolvePendingPayment = async (session: Stripe.Checkout.Session) => {
  const pendingPaymentId =
    session.metadata?.pendingPaymentId || session.client_reference_id;

  if (pendingPaymentId) {
    const pending = await PendingGatewayPayment.findById(pendingPaymentId);
    if (pending) return pending;
  }

  if (session.id) {
    return PendingGatewayPayment.findOne({ providerSessionId: session.id });
  }

  return null;
};

const markAsFailed = async (session: Stripe.Checkout.Session) => {
  const pending = await resolvePendingPayment(session);
  if (!pending || pending.status === "paid") return;

  pending.status = "failed";
  await pending.save();
};

const settleStripeCheckout = async (session: Stripe.Checkout.Session) => {
  const pending = await resolvePendingPayment(session);
  if (!pending || pending.method !== "stripe") return;

  const providerReference =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

  if (pending.status === "paid") {
    if (providerReference && !pending.providerPaymentId) {
      pending.providerPaymentId = providerReference;
      await pending.save();
    }
    return;
  }

  await settleOrderPayment({
    orderId: pending.orderId.toString(),
    walletAmount: pending.walletAmount,
    source: "stripe",
    providerReference,
  });

  pending.status = "paid";
  pending.providerPaymentId = providerReference;
  await pending.save();
};

export async function POST(req: NextRequest) {
  try {
    if (!stripeSecret) {
      return NextResponse.json(
        { success: false, message: "Stripe is not configured yet." },
        { status: 500 },
      );
    }

    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, message: "STRIPE_WEBHOOK_SECRET is not configured." },
        { status: 500 },
      );
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    const payload = await req.text();
    const stripe = new Stripe(stripeSecret);
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    await connectDB();

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await settleStripeCheckout(session);
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markAsFailed(session);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Stripe webhook handling failed",
      },
      { status: 400 },
    );
  }
}
