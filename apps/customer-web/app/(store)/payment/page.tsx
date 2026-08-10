"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deductWalletAmount,
  getWalletOverview,
} from "@/store/wallet/walletSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import axios from "@nasi/api-sdk/client";
import { RAZORPAY_THEME_COLOR } from "@nasi/theme";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type GatewayMethod =
  | "wallet"
  | "momopay"
  | "stripe"
  | "paypal"
  | "razorpay"
  | "gpay";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const paymentMethods: Record<
  GatewayMethod,
  { id: GatewayMethod; name: string; icon: string }
> = {
  wallet: {
    id: "wallet",
    name: "MyWallet",
    icon: "/images/payment/wallet.png",
  },
  momopay: {
    id: "momopay",
    name: "MoMo",
    icon: "/images/payment/momo-pay.png",
  },
  stripe: { id: "stripe", name: "Stripe", icon: "/images/payment/stripe.svg" },
  paypal: { id: "paypal", name: "PayPal", icon: "/images/payment/paypal.png" },
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    icon: "/images/payment/razorpay.svg",
  },
  gpay: { id: "gpay", name: "GPay", icon: "/images/payment/gpay.svg" },
};

const methodsByCurrency: Record<string, GatewayMethod[]> = {
  UGX: ["momopay", "stripe", "paypal"],
  INR: ["razorpay", "gpay", "stripe", "paypal"],
  USD: ["stripe", "paypal"],
};

const PaymentOption = ({
  id,
  name,
  icon,
  selected,
  onSelect,
}: {
  id: GatewayMethod;
  name: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`w-[31%] max-md:w-[48%] max-md:my-2 border-r cursor-pointer rounded-md py-6 px-4 ${
      selected ? "bg-white border border-orange-500" : "bg-slate-100"
    }`}
  >
    <div className="flex flex-col gap-0.75 justify-center items-center">
      <Image src={icon} alt={name} width={50} height={50} />
      <span className="text-slate-600 max-md:text-sm">{name}</span>
    </div>
  </div>
);

const PayNowButton = ({
  disabled,
  onClick,
  loader,
}: {
  disabled: boolean;
  onClick: () => void;
  loader?: boolean;
}) => (
  <div className="w-full px-4 py-8 rounded-md bg-white shadow-sm">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-10 py-1.5 rounded-sm text-white ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-orange-500 hover:shadow-orange-500/20 hover:shadow-lg"
      }`}
    >
      {loader ? (
        <Loader2 className="animate-spin h-5 w-5 inline-block" />
      ) : (
        "Pay Now"
      )}
      {disabled && (
        <span className="ml-2 text-sm">Please select a payment method</span>
      )}
    </button>
  </div>
);

const PaymentPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency, currencyCode } = useCurrency();
  const { orderId, items, totalPrice } = useAppSelector((state) => state.order);
  const { userInfo } = useAppSelector((state) => state.auth);
  const { walletBalance, loader } = useAppSelector((state) => state.wallet);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isSubscriptionCustomer =
    hydrated && userInfo?.customerType === "subscription";
  const regionalMethods =
    methodsByCurrency[currencyCode] || methodsByCurrency.USD;
  const baseMethods = regionalMethods.map((method) => paymentMethods[method]);
  const availablePaymentMethods = isSubscriptionCustomer
    ? [paymentMethods.wallet, ...baseMethods]
    : baseMethods;
  const [paymentMethod, setPaymentMethod] = useState<GatewayMethod>(
    isSubscriptionCustomer ? "wallet" : regionalMethods[0],
  );
  const [phone, setPhone] = useState("");
  const safeItems = hydrated ? items : 0;
  const safeTotalPrice = hydrated ? totalPrice : 0;

  useEffect(() => {
    setPaymentMethod(isSubscriptionCustomer ? "wallet" : regionalMethods[0]);
  }, [isSubscriptionCustomer, currencyCode]);

  const walletUsed = isSubscriptionCustomer
    ? Math.min(walletBalance, safeTotalPrice)
    : 0;
  const payByGateway = safeTotalPrice - walletUsed;

  useEffect(() => {
    if (!isSubscriptionCustomer) return;
    dispatch(getWalletOverview());
  }, [dispatch, isSubscriptionCustomer]);

  const loadRazorpayScript = async () => {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (payload: any) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      toast.error("Unable to load Razorpay. Please try again.");
      return;
    }

    const razorpay = new window.Razorpay({
      key: payload.keyId,
      amount: payload.amount,
      currency: payload.currency,
      name: payload.name,
      description: payload.description,
      order_id: payload.orderId,
      prefill: payload.prefill,
      notes: payload.notes,
      theme: { color: RAZORPAY_THEME_COLOR },
      handler: async (response: any) => {
        const { data } = await axios.post("/payments/confirm", {
          gateway: payload.method,
          pendingPaymentId: payload.pendingPaymentId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        if (!data?.success) {
          toast.error(data?.message || "Payment verification failed.");
          return;
        }

        toast.success("Payment completed successfully.");
        router.push(`/orderConfirm?gateway=${payload.method}&status=success`);
      },
      modal: {
        ondismiss: () => {
          toast("Payment cancelled.");
        },
      },
      config: payload.config,
    });

    razorpay.open();
  };

  const handlePayNow = async () => {
    try {
      if (!orderId) {
        toast.error(
          "Order details are missing. Please try from your order page.",
        );
        return;
      }

      if (payByGateway > 0) {
        if (paymentMethod === "wallet") {
          toast.error("Please choose a gateway for the remaining amount.");
          return;
        }

        if (paymentMethod === "momopay") {
          if (!phone.trim()) {
            toast.error("Please enter your MoMo phone number.");
            return;
          }
        }

        const { data } = await axios.post("/payments/initiate", {
          method: paymentMethod,
          amount: payByGateway,
          walletAmount: walletUsed,
          orderId,
          currencyCode,
          externalId: `${orderId}-${Date.now()}`,
          phone: phone.trim(),
          customerName: userInfo?.name || "Customer",
          customerEmail: userInfo?.email || "",
          customerId: userInfo?.id,
        });

        if (!data?.success) {
          toast.error(data?.message || "Failed to initiate payment.");
          return;
        }

        if (data.provider === "redirect" && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }

        if (data.provider === "razorpay" && data.razorpay) {
          await openRazorpay({
            ...data.razorpay,
            method: paymentMethod,
            pendingPaymentId: data.pendingPaymentId,
          });
          return;
        }

        if (data.provider === "momo") {
          toast.success("Payment request sent. Please approve on your phone.");
          router.push(
            `/orderConfirm?gateway=momopay&pendingPaymentId=${data.pendingPaymentId}`,
          );
          return;
        }

        toast.success("Payment initiated successfully.");
        return;
      }

      if (isSubscriptionCustomer && walletUsed > 0) {
        await dispatch(
          deductWalletAmount({
            payAmount: walletUsed,
            orderId,
          }),
        ).unwrap();
        toast.success("Payment completed from wallet.");
        router.push("/orderConfirm");
        return;
      }

      toast.error("Nothing to pay. Please check your order amount.");
    } catch (error: any) {
      toast.error(error?.message || "Payment failed. Please try again.");
    }
  };

  if (!hydrated) {
    return (
      <section className="bg-[#eeeeee]">
        <div className="max-w-360 mx-auto lg:px-12 px-10 py-16 mt-4">
          <div className="bg-white p-6 rounded-md shadow text-slate-600">
            Preparing payment details...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#eeeeee]">
      <div className="max-w-360 mx-auto lg:px-12 px-10 py-16 mt-4">
        <div className="flex flex-wrap max-md:flex-col-reverse">
          {/* Left: Payment Options */}
          <div className="w-7/12 max-md:my-2 max-md:w-full pr-2 max-md:pr-0">
            <div className="bg-white p-4 mb-4 rounded-md shadow text-slate-600">
              {isSubscriptionCustomer ? (
                <>
                  <p>
                    <strong>Wallet Balance:</strong>{" "}
                    {formatCurrency(walletBalance)}
                  </p>
                  <p>Used from Wallet: {formatCurrency(walletUsed)}</p>
                </>
              ) : (
                <p>
                  <strong>Payment Mode:</strong> Direct gateway payment
                </p>
              )}
              {payByGateway > 0 ? (
                <p>
                  Remaining {formatCurrency(payByGateway)} will be paid using{" "}
                  {paymentMethod !== "wallet"
                    ? paymentMethod
                    : "another method"}
                </p>
              ) : (
                <p className="text-green-600 font-semibold">
                  Full payment covered by wallet.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {availablePaymentMethods.map((method) => (
                <PaymentOption
                  key={method.id}
                  id={method.id}
                  name={method.name}
                  icon={method.icon}
                  selected={paymentMethod === method.id}
                  onSelect={() => setPaymentMethod(method.id)}
                />
              ))}
            </div>

            {payByGateway > 0 && paymentMethod === "momopay" && (
              <div className="mt-4 bg-white p-4 rounded-md border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  MoMo Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 256701234567"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-orange-400"
                />
              </div>
            )}

            {payByGateway > 0 &&
              ["stripe", "paypal", "razorpay", "gpay"].includes(
                paymentMethod,
              ) && (
                <div className="mt-4 bg-white p-4 rounded-md border border-slate-200 text-sm text-slate-600">
                  You will be redirected to {paymentMethods[paymentMethod].name}{" "}
                  to complete payment securely.
                </div>
              )}

            <PayNowButton
              disabled={payByGateway > 0 && paymentMethod === "wallet"}
              onClick={handlePayNow}
              loader={loader}
            />
          </div>

          {/* Right: Order Summary */}
          <div className="w-5/12 max-md:w-full pl-2 max-md:pl-0 md:mb-0">
            <div className="bg-white shadow rounded-md p-5 text-slate-600 flex flex-col gap-3">
              <h2>Order Summary</h2>
              <div className="flex justify-between items-center">
                <span>{safeItems} items and shipping fee included</span>
                <span>{formatCurrency(safeTotalPrice)}</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Total Amount</span>
                <span className="text-lg text-orange-500">
                  {formatCurrency(safeTotalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;
