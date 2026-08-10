"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getWalletOverview } from "@/store/wallet/walletSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import axios from "@nasi/api-sdk/client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FadeLoader from "react-spinners/FadeLoader";

const Page = () => {
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const searchParams = useSearchParams();
  const { walletBalance, successMessage, errorMessage, loader } =
    useAppSelector((state) => state.wallet);
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "pending"
  >("loading");
  const [message, setMessage] = useState("Confirming payment...");

  const gateway = searchParams.get("gateway");
  const pendingPaymentId = searchParams.get("pendingPaymentId");
  const stripeSessionId = searchParams.get("session_id");
  const paypalOrderId = searchParams.get("token");

  useEffect(() => {
    dispatch(getWalletOverview());
  }, [dispatch]);

  useEffect(() => {
    const confirmGatewayPayment = async () => {
      if (!gateway || !pendingPaymentId) {
        if (successMessage) {
          setStatus("success");
          setMessage(successMessage);
          return;
        }

        if (errorMessage) {
          setStatus("error");
          setMessage(errorMessage);
          return;
        }

        setStatus("success");
        setMessage("Payment request submitted successfully.");
        return;
      }

      try {
        const { data } = await axios.post("/payments/confirm", {
          gateway,
          pendingPaymentId,
          sessionId: stripeSessionId || undefined,
          paypalOrderId: paypalOrderId || undefined,
        });

        if (data?.pending) {
          setStatus("pending");
          setMessage(data.message || "Payment is still pending confirmation.");
          return;
        }

        if (!data?.success) {
          setStatus("error");
          setMessage(data?.message || "Payment confirmation failed.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Payment confirmed successfully.");
      } catch (confirmError: any) {
        const apiMessage =
          confirmError?.response?.data?.message ||
          confirmError?.message ||
          "Payment confirmation failed.";

        setStatus("error");
        setMessage(apiMessage);
      }
    };

    confirmGatewayPayment();
  }, [
    errorMessage,
    gateway,
    pendingPaymentId,
    paypalOrderId,
    stripeSessionId,
    successMessage,
  ]);

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-4">
      {loader || status === "loading" ? (
        <FadeLoader />
      ) : status === "error" ? (
        <>
          <Image src="/images/error.png" alt="Error" width={100} height={100} />
          <h1 className="text-red-500 text-2xl font-semibold">
            Error: {message}
          </h1>
          <h2 className="text-slate-800 text-xl">
            walletBalance: {formatCurrency(walletBalance)}
          </h2>
          <Link
            href="/dashboard"
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Go to User Dashboard
          </Link>
        </>
      ) : status === "pending" ? (
        <>
          <Image
            src="/images/payment/wallet.png"
            alt="Pending"
            width={100}
            height={100}
          />
          <h1 className="text-amber-500 text-2xl font-semibold">{message}</h1>
          <h2 className="text-slate-800 text-xl">
            walletBalance: {formatCurrency(walletBalance)}
          </h2>
          <Link
            href="/payment"
            className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
          >
            Back to Payment
          </Link>
        </>
      ) : (
        <>
          <Image
            src="/images/success.png"
            alt="Success"
            width={100}
            height={100}
          />
          <h1 className="text-green-500 text-2xl font-semibold">
            Success: {message}
          </h1>
          <h2 className="text-slate-800 text-xl">
            walletBalance: {formatCurrency(walletBalance)}
          </h2>
          <Link
            href="/dashboard"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Go to User Dashboard
          </Link>
        </>
      )}
    </div>
  );
};

export default Page;
