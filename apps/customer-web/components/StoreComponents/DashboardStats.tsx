"use client";

import {
  authMessageClear,
  initiate_subscription_payment,
  confirm_subscription_payment,
} from "@/store/Auth/authSlice";
import { get_dashboard_index_data } from "@/store/Dashboard/dashboardSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import React, { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AiOutlineShoppingCart,
  AiOutlineWallet,
  AiOutlineUserAdd,
  AiOutlineGift,
} from "react-icons/ai";
import { setOrderDetails } from "@/store/Order/orderSlice";
import { formatPrice } from "@/utils/formatPrice";
import { Order } from "@nasi/types/order";
import { SUBSCRIPTION_JOINING_FEE } from "@nasi/constants/subscription";
import UniversalShareButtons from "./UniversalShareButtons";

const DashboardStats = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { user, walletBalance, totalOrders, recentOrders, orderCounts } =
    useAppSelector((state) => state.dashboard);
  const { loader: authLoader } = useAppSelector((state) => state.auth);
  const [referralCode, setReferralCode] = useState("");
  const [phone, setPhone] = useState("");
  const [momoReferenceId, setMomoReferenceId] = useState("");
  const paymentInitiated = Boolean(momoReferenceId);

  const isSubscriptionCustomer =
    (user?.customerType || userInfo?.customerType) === "subscription";

  useEffect(() => {
    if (userInfo?.id) {
      dispatch(get_dashboard_index_data(userInfo.id));
    }
  }, [userInfo?.id, userInfo?.customerType, dispatch]);

  const redirect = (order: any) => {
    dispatch(
      setOrderDetails({
        orderId: order._id,
        totalPrice: order.price,
        items: order.products.reduce(
          (sum: number, p: any) => sum + p.quantity,
          0,
        ),
      }),
    );
    router.push("/payment");
  };

  const cellClass =
    "px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]";

  const handleInitiatePayment = () => {
    if (!referralCode.trim() || !phone.trim()) return;
    dispatch(
      initiate_subscription_payment({
        referralCode: referralCode.trim(),
        phone: phone.trim(),
      }),
    ).then((action: any) => {
      if (action.payload?.momoReferenceId) {
        setMomoReferenceId(action.payload.momoReferenceId);
      }
    });
  };

  const handleConfirmPayment = () => {
    if (!momoReferenceId) return;
    dispatch(confirm_subscription_payment({ momoReferenceId }));
  };

  return (
    <>
      {/* Quick Stats */}
      <div className="grid items-start justify-start grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          icon={<AiOutlineShoppingCart />}
          color="green"
          value={totalOrders}
          label="Total Orders"
        />
        {isSubscriptionCustomer ? (
          <>
            <StatCard
              icon={<AiOutlineWallet />}
              color="blue"
              value={formatCurrency(walletBalance || 0)}
              label="Wallet Balance"
            />
            <StatCard
              icon={<AiOutlineGift />}
              color="purple"
              value={user?.referralCode || "-"}
              label="Referral Code"
            />
            <StatCard
              icon={<AiOutlineUserAdd />}
              color="yellow"
              value={user?.referralCount || 0}
              label="Referred Users"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<AiOutlineWallet />}
              color="blue"
              value={orderCounts.pending}
              label="Pending Orders"
            />
            <StatCard
              icon={<AiOutlineGift />}
              color="purple"
              value={orderCounts.paid}
              label="Paid Orders"
            />
            <StatCard
              icon={<AiOutlineUserAdd />}
              color="yellow"
              value="Normal"
              label="Account Type"
            />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-4 mt-5 rounded-md">
        <h2 className="text-lg font-semibold text-slate-600">Recent Orders</h2>
        <div className="pt-4">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm max-md:text-[8px] text-left text-gray-500">
              <thead className="text-gray-700 my-1 uppercase bg-gray-50">
                <tr>
                  {[
                    "Order Id",
                    "Price",
                    "Payment Status",
                    "Order Status",
                    "Action",
                  ].map((h) => (
                    <th key={h} className={cellClass}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: Order) => (
                  <tr key={order._id} className="bg-white border-b">
                    <td className={cellClass}>{order._id}</td>
                    <td className={cellClass}>{formatCurrency(order.price)}</td>
                    <td className={cellClass}>{order.payment_status}</td>
                    <td className={cellClass}>{order.delivery_status}</td>
                    <td className={cellClass}>
                      <Link href={`/dashboard/orders/${order._id}`}>
                        <span className="bg-green-100 text-green-800 text-sm max-md:text-[8px] font-normal mr-2 px-2.5 max-md:px-1 py-px rounded">
                          View
                        </span>
                      </Link>
                      {order.payment_status !== "paid" && (
                        <span
                          onClick={() => redirect(order)}
                          className="bg-red-100 text-red-800 text-sm max-md:text-[8px] font-normal mr-2 px-2.5 max-md:px-1 py-px rounded cursor-pointer"
                        >
                          Pay Now
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Referral Code Share */}
      {isSubscriptionCustomer ? (
        <div className="bg-purple-100 p-4 mt-6 rounded-md">
          <p className="font-semibold text-purple-700">
            Invite your friends and earn {formatCurrency(500)} for every
            referral!
          </p>
          <div className="flex flex-col gap-4 mt-2">
            <input
              readOnly
              value={user?.referralCode || "N/A"}
              className="bg-white border px-4 py-2 rounded w-full"
            />
            <UniversalShareButtons
              message={`Join me on this amazing store and earn rewards using my referral code: ${user?.referralCode}`}
              url={`https://www.nasistore.com/signup?ref=${user?.referralCode}`}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 mt-6 rounded-md border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700">
            Join Subscription
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Unlock wallet and referral earnings. Enter your referral code and
            MoMo phone — we will charge{" "}
            {formatCurrency(SUBSCRIPTION_JOINING_FEE)} to activate your account.
          </p>

          {!paymentInitiated ? (
            <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 mt-4">
              <input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Referral code"
                className="bg-slate-50 border px-4 py-2 rounded w-full"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="MoMo phone e.g. 256701234567"
                className="bg-slate-50 border px-4 py-2 rounded w-full"
              />
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={authLoader || !referralCode.trim() || !phone.trim()}
                className="px-5 py-2 rounded bg-slate-800 text-white disabled:opacity-50"
              >
                {authLoader ? "Requesting..." : "Pay Joining Fee"}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-green-700 font-medium">
                Payment requested. Approve on your phone then click Confirm
                below.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={authLoader}
                  className="px-5 py-2 rounded bg-green-700 text-white disabled:opacity-50"
                >
                  {authLoader ? "Checking..." : "Confirm Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => setMomoReferenceId("")}
                  className="px-4 py-2 rounded bg-slate-200 text-slate-700"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DashboardStats;

const StatCard = ({
  icon,
  color,
  value,
  label,
}: {
  icon: React.JSX.Element;
  color: string;
  value: any;
  label: string;
}) => {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    green: { bg: "bg-green-100", text: "text-green-800" },
    blue: { bg: "bg-blue-100", text: "text-blue-800" },
    red: { bg: "bg-red-100", text: "text-red-800" },
    purple: { bg: "bg-purple-100", text: "text-purple-800" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-800" },
  };

  const { bg, text } = colorClasses[color] || colorClasses.green;

  return (
    <div className="flex justify-center items-center p-5 bg-white rounded-md gap-5">
      <div
        className={`${bg} w-11.75 max-md:w-7.5 max-md:h-7.5 max-md:text-lg h-11.75 rounded-full flex justify-center items-center text-xl`}
      >
        <span className={text}>{icon}</span>
      </div>
      <div className="flex flex-col justify-start items-start text-slate-600">
        <h2 className="text-2xl max-md:text-xs font-semibold">{value}</h2>
        <span className="max-sm:text-[8px]">{label}</span>
      </div>
    </div>
  );
};
