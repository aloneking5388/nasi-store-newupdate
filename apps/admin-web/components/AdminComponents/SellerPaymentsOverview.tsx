"use client";

import axios from "@nasi/api-sdk/client";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type SellerBalance = {
  sellerId: string;
  sellerName: string;
  profileImage: string;
  totalBalance: number;
  availableBalance: number;
  reservedCashout: number;
};

type CashoutRecord = {
  id: string;
  sellerId: string;
  sellerName: string;
  profileImage: string;
  amount: number;
  note: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  monthLabel?: string;
};

type AdminSellerPaymentsPayload = {
  totalSellerBalance: number;
  totalCashoutBalance: number;
  recentCashoutBalance: number;
  totalPendingCashouts: number;
  totalApprovedCashouts: number;
  totalRejectedCashouts: number;
  sellerBalances: SellerBalance[];
  recentCashouts: CashoutRecord[];
};

const badgeStyles: Record<CashoutRecord["status"], string> = {
  pending: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  rejected: "bg-rose-500/20 text-rose-200 border-rose-500/30",
};

const AdminSellerPaymentsOverview = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<AdminSellerPaymentsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token || ""}` } }),
    [token],
  );

  const loadData = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get<AdminSellerPaymentsPayload>(
        "/admin/seller-payments",
        authHeader,
      );
      setData(data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: { token },
    });

    socket.on("seller:cashout-updated", loadData);

    const fallback = setInterval(loadData, 30000);

    return () => {
      socket.disconnect();
      clearInterval(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="h-full text-[#d0d2d6]">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Seller Cashouts</h2>
        <span className="text-sm text-slate-400">Live overview</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <div className="rounded-lg border border-slate-600 bg-[#1f273a] p-4">
          <p className="text-xs text-slate-400">Total Seller Balance</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {formatCurrency(data?.totalSellerBalance || 0)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-600 bg-[#1f273a] p-4">
          <p className="text-xs text-slate-400">Cashout Balance</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {formatCurrency(data?.totalCashoutBalance || 0)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-600 bg-[#1f273a] p-4">
          <p className="text-xs text-slate-400">Recent Cashout</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {formatCurrency(data?.recentCashoutBalance || 0)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-300">
        <div className="rounded-lg border border-slate-600 bg-[#1f273a] p-3">
          Pending: {data?.totalPendingCashouts || 0}
        </div>
        <div className="rounded-lg border border-slate-600 bg-[#1f273a] p-3">
          Approved: {data?.totalApprovedCashouts || 0}
        </div>
        <div className="rounded-lg border border-slate-600 bg-[#1f273a] p-3">
          Rejected: {data?.totalRejectedCashouts || 0}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-600 bg-[#1f273a] p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-white">Recent Requests</h3>
          <span className="text-xs text-slate-400">Latest 10 cashouts</span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading seller payments...</p>
        ) : (data?.recentCashouts || []).length === 0 ? (
          <p className="text-sm text-slate-400">No cashout requests yet.</p>
        ) : (
          <div className="space-y-3 max-h-70 overflow-y-auto pr-1">
            {data!.recentCashouts.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 rounded-lg border border-slate-700 bg-[#283046] p-3"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
                  {record.profileImage ? (
                    <Image
                      src={record.profileImage}
                      alt={record.sellerName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white font-semibold uppercase">
                      {record.sellerName.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white truncate">
                      {record.sellerName}
                    </p>
                    <span
                      className={`rounded-full border px-2 py-1 text-[11px] ${badgeStyles[record.status]}`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatCurrency(record.amount)} ·{" "}
                    {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-300 mt-1 wrap-break-word">
                    {record.note || "No note provided"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-lg border border-slate-600 bg-[#1f273a] p-4">
        <h3 className="font-semibold text-white mb-3">Top Seller Balances</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading seller balances...</p>
        ) : (data?.sellerBalances || []).length === 0 ? (
          <p className="text-sm text-slate-400">No seller balance data yet.</p>
        ) : (
          <div className="space-y-2">
            {data!.sellerBalances.map((seller) => (
              <div
                key={seller.sellerId}
                className="flex items-center justify-between rounded-md bg-[#283046] px-3 py-2 border border-slate-700"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {seller.sellerName}
                  </p>
                  <p className="text-xs text-slate-400">
                    Reserved: {formatCurrency(seller.reservedCashout)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-300">
                    {formatCurrency(seller.availableBalance)}
                  </p>
                  <p className="text-xs text-slate-400">Available</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellerPaymentsOverview;
