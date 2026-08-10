import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { getAccessToken, requestToPay } from "@/lib/momo";
import { getRatesFromUGX } from "@/lib/currencyRates";
import PendingGatewayPayment from "@/models/PendingGatewayPayment";
import { connectDB } from "@/utils/ConnectDB";
import { convertAmountFromUGX } from "@/utils/formatPrice";

type Method = "momopay" | "stripe" | "paypal" | "razorpay" | "gpay";
type CurrencyCode = "UGX" | "INR" | "USD";

const zeroDecimalCurrencies = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

const resolveBaseUrl = (req: NextRequest) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (appUrl) return appUrl.replace(/\/$/, "");

  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  return `${proto}://${host}`;
};

const toMinorUnit = (amount: number, currency: string) => {
  const normalized = currency.toLowerCase();
  const multiplier = zeroDecimalCurrencies.has(normalized) ? 1 : 100;
  return Math.round(amount * multiplier);
};

const createStripeCheckout = async ({
  amount,
  currencyCode,
  orderId,
  customerEmail,
  baseUrl,
  pendingPaymentId,
}: {
  amount: number;
  currencyCode: CurrencyCode;
  orderId: string;
  customerEmail?: string;
  baseUrl: string;
  pendingPaymentId: string;
}) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    throw new Error(
      "Stripe is not configured yet. Please set STRIPE_SECRET_KEY.",
    );
  }

  const stripe = new Stripe(stripeSecret);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/orderConfirm?gateway=stripe&status=success&orderId=${orderId}&pendingPaymentId=${pendingPaymentId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/payment?gateway=stripe&status=cancelled&orderId=${orderId}`,
    customer_email: customerEmail || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currencyCode.toLowerCase(),
          product_data: {
            name: `Order ${orderId}`,
            description: "Nasi Store purchase",
          },
          unit_amount: toMinorUnit(amount, currencyCode),
        },
      },
    ],
    metadata: {
      orderId,
      pendingPaymentId,
    },
    client_reference_id: pendingPaymentId,
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal is not configured yet. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    );
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
    const details = await tokenResponse.text();
    throw new Error(`Unable to authenticate PayPal: ${details}`);
  }

  const tokenData = await tokenResponse.json();
  return { accessToken: tokenData.access_token as string, base };
};

const createPayPalOrder = async ({
  amount,
  currencyCode,
  orderId,
  baseUrl,
  pendingPaymentId,
}: {
  amount: number;
  currencyCode: CurrencyCode;
  orderId: string;
  baseUrl: string;
  pendingPaymentId: string;
}) => {
  const { accessToken, base } = await getPayPalAccessToken();
  const paypalCurrency = currencyCode === "UGX" ? "USD" : currencyCode;

  const orderResponse = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: paypalCurrency,
            value: amount.toFixed(2),
          },
          description: `Order ${orderId}`,
        },
      ],
      application_context: {
        return_url: `${baseUrl}/orderConfirm?gateway=paypal&status=success&orderId=${orderId}&pendingPaymentId=${pendingPaymentId}`,
        cancel_url: `${baseUrl}/payment?gateway=paypal&status=cancelled&orderId=${orderId}`,
      },
    }),
    cache: "no-store",
  });

  if (!orderResponse.ok) {
    const details = await orderResponse.text();
    throw new Error(`Unable to create PayPal order: ${details}`);
  }

  const orderData = await orderResponse.json();
  const approveLink = (orderData.links || []).find(
    (link: any) => link.rel === "approve",
  )?.href;

  if (!approveLink) {
    throw new Error("PayPal did not return an approval URL.");
  }

  return {
    checkoutUrl: approveLink,
    providerOrderId: orderData.id as string,
  };
};

const createRazorpayOrder = async ({
  amount,
  method,
  orderId,
  customerName,
  customerEmail,
  phone,
}: {
  amount: number;
  method: Method;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  phone?: string;
}) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured yet. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const order = await razorpay.orders.create({
    amount: toMinorUnit(amount, "INR"),
    currency: "INR",
    receipt: `order_${orderId.slice(-12)}`,
    notes: {
      orderId,
      method,
    },
  });

  return {
    keyId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    name: "Nasi Store",
    description: `Order ${orderId}`,
    prefill: {
      name: customerName || "Customer",
      email: customerEmail || "",
      contact: phone || "",
    },
    notes: {
      orderId,
    },
    config:
      method === "gpay"
        ? {
            display: {
              blocks: {
                upi: {
                  name: "Pay via UPI Apps",
                  instruments: [{ method: "upi" }],
                },
              },
              sequence: ["block.upi"],
              preferences: {
                show_default_blocks: false,
              },
            },
          }
        : undefined,
  };
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      method,
      amount,
      orderId,
      externalId,
      phone,
      currencyCode,
      customerName,
      customerEmail,
      walletAmount = 0,
      customerId,
    }: {
      method: Method;
      amount: number;
      orderId: string;
      externalId?: string;
      phone?: string;
      currencyCode: CurrencyCode;
      customerName?: string;
      customerEmail?: string;
      walletAmount?: number;
      customerId?: string;
    } = body;

    if (!method || !amount || !orderId || !currencyCode) {
      return NextResponse.json(
        {
          success: false,
          message: "method, amount, orderId and currencyCode are required",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    const baseUrl = resolveBaseUrl(req);
    const numericAmount = Number(amount);
    const ratesFromUGX = await getRatesFromUGX();
    const gatewayAmount = convertAmountFromUGX(
      numericAmount,
      currencyCode,
      ratesFromUGX,
    );
    const pendingPayment = await PendingGatewayPayment.create({
      customerId,
      orderId,
      method,
      currencyCode,
      gatewayAmount,
      walletAmount: Number(walletAmount) || 0,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    if (method === "momopay") {
      if (!phone || !externalId) {
        return NextResponse.json(
          {
            success: false,
            message: "phone and externalId are required for MoMo",
          },
          { status: 400 },
        );
      }

      const token = await getAccessToken();
      const result = await requestToPay({
        amount: String(gatewayAmount),
        phone,
        externalId,
        token,
      });

      pendingPayment.providerReference = result.uuid;
      await pendingPayment.save();

      return NextResponse.json({
        success: true,
        provider: "momo",
        referenceId: result.uuid,
        pendingPaymentId: pendingPayment.id,
      });
    }

    if (method === "stripe") {
      const stripeCheckout = await createStripeCheckout({
        amount: gatewayAmount,
        currencyCode,
        orderId,
        customerEmail,
        baseUrl,
        pendingPaymentId: pendingPayment.id,
      });

      pendingPayment.providerSessionId = stripeCheckout.sessionId;
      await pendingPayment.save();

      return NextResponse.json({
        success: true,
        provider: "redirect",
        checkoutUrl: stripeCheckout.checkoutUrl,
        pendingPaymentId: pendingPayment.id,
      });
    }

    if (method === "paypal") {
      const paypalOrder = await createPayPalOrder({
        amount: gatewayAmount,
        currencyCode,
        orderId,
        baseUrl,
        pendingPaymentId: pendingPayment.id,
      });

      pendingPayment.providerOrderId = paypalOrder.providerOrderId;
      await pendingPayment.save();

      return NextResponse.json({
        success: true,
        provider: "redirect",
        checkoutUrl: paypalOrder.checkoutUrl,
        pendingPaymentId: pendingPayment.id,
      });
    }

    if (method === "razorpay" || method === "gpay") {
      const razorpay = await createRazorpayOrder({
        amount: gatewayAmount,
        method,
        orderId,
        customerName,
        customerEmail,
        phone,
      });

      pendingPayment.providerOrderId = razorpay.orderId;
      await pendingPayment.save();

      return NextResponse.json({
        success: true,
        provider: "razorpay",
        razorpay,
        pendingPaymentId: pendingPayment.id,
      });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported payment method" },
      { status: 400 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to initiate payment",
      },
      { status: 500 },
    );
  }
}
