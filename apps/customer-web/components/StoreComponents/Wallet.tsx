"use client";
import {
  getWalletOverview,
  transferToWallet,
  walletMessageClear,
} from "@/store/wallet/walletSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaWallet } from "react-icons/fa";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import Link from "next/link";

const Wallet = () => {
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { userInfo } = useAppSelector((state) => state.auth);
  const {
    walletBalance,
    referralEarnings,
    transactions,
    loader,
    successMessage,
    errorMessage,
  } = useAppSelector((state) => state.wallet);

  const isSubscriptionCustomer = userInfo?.customerType === "subscription";

  useEffect(() => {
    if (!isSubscriptionCustomer) return;
    dispatch(getWalletOverview());
  }, [dispatch, isSubscriptionCustomer]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(walletMessageClear());
      dispatch(getWalletOverview());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(walletMessageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

  if (!isSubscriptionCustomer) {
    return (
      <div className="bg-white p-6 rounded-md text-slate-600">
        <h2 className="text-xl font-semibold">
          Wallet is only for subscription customers
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Your account is a normal customer account. Join the subscription from
          your dashboard with a referral code to unlock wallet and referral
          benefits.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 px-4 py-2 rounded bg-slate-800 text-white"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const StatCard = ({
    color,
    value,
    label,
    showTransfer,
    earnings,
  }: {
    color: string;
    value: number;
    label: string;
    showTransfer?: boolean;
    earnings?: number;
  }) => {
    const [showInput, setShowInput] = useState(false);
    const [inputAmount, setInputAmount] = useState("");
    const dispatch = useAppDispatch();

    const bgColor = {
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
    }[color];

    const handleTransfer = () => {
      const amt = Number(inputAmount);
      if (!inputAmount || isNaN(amt)) {
        toast.error("Invalid amount or insufficient earnings");
        return;
      }

      if (amt <= 0 || typeof earnings !== "number" || amt > earnings) {
        toast.error("Invalid amount or insufficient earnings");
        return;
      }

      dispatch(transferToWallet(amt));
      setInputAmount("");
      setShowInput(false);
    };

    return (
      <div className="flex flex-col p-5 bg-white rounded-md gap-3">
        <div className="flex gap-5 items-center">
          <div
            className={`${
              bgColor?.split(" ")[0]
            } w-11.75 max-md:w-7.5 max-md:h-7.5 h-11.75 rounded-full flex justify-center max-md:text-lg items-center text-xl`}
          >
            <span className={`${bgColor?.split(" ")[1]}`}>
              <FaWallet />
            </span>
          </div>
          <div className="flex flex-col text-slate-600">
            <h2 className="text-3xl max-md:text-xl font-bold">
              {formatCurrency(value)}
            </h2>
            <span className="max-md:text-sm">{label}</span>
          </div>
        </div>

        {showTransfer && (
          <div>
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="mt-2 text-sm max-md:text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {loader ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  "Add Earnig to Wallet"
                )}
              </button>
            ) : (
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-32 text-sm focus:outline-none focus:ring focus:border-blue-500"
                  placeholder="Enter amount"
                />
                <button
                  onClick={handleTransfer}
                  className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Transfer
                </button>
                <button
                  onClick={() => {
                    setShowInput(false);
                    setInputAmount("");
                  }}
                  className="text-sm px-2 py-1 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="grid items-start justify-start grid-cols-3 max-md:grid-cols-1 gap-5">
        {/* Orders, Pending Orders, Cancelled Orders Cards */}
        <StatCard
          color="green"
          value={walletBalance + referralEarnings}
          label="Total Balance"
        />
        <StatCard color="purple" value={walletBalance} label="Wallet Balance" />
        <StatCard
          color="blue"
          value={referralEarnings}
          label="Referral Earnings"
          showTransfer={true}
          earnings={referralEarnings}
        />
      </div>
      <div className="bg-white p-4 mt-5 rounded-md">
        <h2 className="text-lg font-semibold text-slate-600">
          Transactions History
        </h2>
        <div className="pt-4">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                    Transaction Id
                  </th>
                  <th className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                    Types
                  </th>
                  <th className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                    Amount
                  </th>
                  <th className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                    Purpose
                  </th>
                  <th className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any, i: number) => (
                  <tr key={t._id} className="bg-white border-b">
                    <td className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                      {t._id}
                    </td>
                    <td className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                      {t.type.toUpperCase()}
                    </td>
                    <td className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                      {t.purpose.slice(0, 8)}...
                    </td>
                    <td className="px-6 max-md:px-2 max-md:text-[8px] py-3">
                      <Link href={`/dashboard/wallet/${t._id}`}>
                        <span className="bg-green-100 text-green-800 text-sm max-md:text-[8px] font-normal mr-2 px-2.5 max-md:px-1 py-px rounded">
                          View
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
