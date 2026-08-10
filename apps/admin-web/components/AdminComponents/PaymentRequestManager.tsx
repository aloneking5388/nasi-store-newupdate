"use client";

import axios from "@nasi/api-sdk/client";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { io } from "socket.io-client";

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

type SellerBalance = {
  sellerId: string;
  sellerName: string;
  profileImage: string;
  totalBalance: number;
  availableBalance: number;
  reservedCashout: number;
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
  allCashouts: CashoutRecord[];
};

const badgeStyles: Record<CashoutRecord["status"], string> = {
  pending: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  rejected: "bg-rose-500/20 text-rose-200 border-rose-500/30",
};

const PaymentRequestManager = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<AdminSellerPaymentsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | CashoutRecord["status"]
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load requests");
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

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateStatus = async (
    cashoutId: string,
    status: "approved" | "rejected",
  ) => {
    setProcessingId(cashoutId);
    try {
      const response = await axios.patch(
        `/admin/seller-payments/${cashoutId}`,
        { status },
        authHeader,
      );
      toast.success(response.data?.message || "Cashout updated");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update cashout");
    } finally {
      setProcessingId("");
    }
  };

  const filteredCashouts = (data?.allCashouts || []).filter((record) => {
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    const haystack =
      `${record.sellerName} ${record.note} ${record.amount} ${record.monthLabel || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-[#d0d2d6]">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
          <p className="text-sm text-slate-400">Total Seller Balance</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(data?.totalSellerBalance || 0)}
          </h3>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
          <p className="text-sm text-slate-400">Cashout Balance</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(data?.totalCashoutBalance || 0)}
          </h3>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
          <p className="text-sm text-slate-400">Pending Requests</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {data?.totalPendingCashouts || 0}
          </h3>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#283046] shadow-lg">
        <div className="flex flex-col gap-4 border-b border-slate-700 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Payment Requests
            </h2>
            <p className="text-sm text-slate-400">
              Approve or reject seller cashouts.
            </p>
          </div>
          <span className="text-xs text-slate-400">Live updates enabled</span>
        </div>

        <div className="grid gap-3 border-b border-slate-700 px-5 py-4 md:grid-cols-[1fr_200px] lg:grid-cols-[1fr_220px]">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search seller name, note, amount, or month"
              className="w-full rounded-md border border-slate-600 bg-[#1f273a] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | CashoutRecord["status"],
                )
              }
              className="w-full rounded-md border border-slate-600 bg-[#1f273a] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-sm text-slate-400">
            Loading payment requests...
          </div>
        ) : filteredCashouts.length === 0 ? (
          <div className="px-5 py-10 text-sm text-slate-400">
            No seller payment requests match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr className="border-b border-slate-700">
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCashouts.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-700/60 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
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
                        <div>
                          <p className="font-medium text-white">
                            {record.sellerName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStyles[record.status]}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {record.note || "No note provided"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={
                            processingId === record.id ||
                            record.status === "approved"
                          }
                          onClick={() => updateStatus(record.id, "approved")}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                        >
                          {processingId === record.id &&
                          record.status !== "approved" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={
                            processingId === record.id ||
                            record.status === "rejected"
                          }
                          onClick={() => updateStatus(record.id, "rejected")}
                          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                        >
                          {processingId === record.id &&
                          record.status !== "rejected" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Reject"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentRequestManager;
