"use client";

import axios from "@nasi/api-sdk/client";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/utils/formatPrice";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

type CashoutRecord = {
  id: string;
  amount: number;
  note: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  monthLabel?: string;
};

type SellerPaymentsPayload = {
  totalBalance: number;
  cashoutBalance: number;
  recentCashoutBalance: number;
  history: CashoutRecord[];
  earningHistory: Array<{
    id: string;
    amount: number;
    month: number;
    year: number;
    label: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

const badgeStyles: Record<CashoutRecord["status"], string> = {
  pending: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  rejected: "bg-rose-500/20 text-rose-200 border-rose-500/30",
};

const SellerPayments = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<SellerPaymentsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token || ""}` } }),
    [token],
  );

  const loadPayments = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get<SellerPaymentsPayload>(
        "/seller/payments",
        authHeader,
      );
      setData(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRequestCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim()) {
      toast.error("Enter cashout amount");
      return;
    }

    setRequesting(true);
    try {
      const response = await axios.post(
        "/seller/payments",
        { amount: Number(amount), note },
        authHeader,
      );
      toast.success(response.data?.message || "Cashout requested");
      setAmount("");
      setNote("");
      await loadPayments();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to request cashout",
      );
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#d0d2d6]">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
          <p className="text-sm text-slate-400">Total Balance</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(data?.totalBalance || 0)}
          </h3>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
          <p className="text-sm text-slate-400">Cashout Balance</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(data?.cashoutBalance || 0)}
          </h3>
        </div>
        <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
          <p className="text-sm text-slate-400">Recent Cashout Balance</p>
          <h3 className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(data?.recentCashoutBalance || 0)}
          </h3>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-slate-700 bg-[#283046] shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Cashout History
              </h2>
              <p className="text-sm text-slate-400">
                Latest requests and payout status.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr className="border-b border-slate-700">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-400" colSpan={4}>
                      Loading payment history...
                    </td>
                  </tr>
                ) : (data?.history || []).length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-400" colSpan={4}>
                      No cashout history yet.
                    </td>
                  </tr>
                ) : (
                  data!.history.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-700/60 last:border-b-0"
                    >
                      <td className="px-5 py-4 text-slate-300">
                        {new Date(record.createdAt).toLocaleDateString()}
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
                        {record.note || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-white">
              Request Cashout
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Submit a withdrawal request from your available balance.
            </p>

            <form onSubmit={handleRequestCashout} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-md border border-slate-600 bg-[#1f273a] px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                  rows={4}
                  className="w-full rounded-md border border-slate-600 bg-[#1f273a] px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={requesting || loading}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {requesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Request Cashout"
                )}
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#283046] p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-white">
              Earning History
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Monthly seller wallet records used to calculate your balance.
            </p>

            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="text-sm text-slate-400">
                  Loading earning history...
                </p>
              ) : (data?.earningHistory || []).length === 0 ? (
                <p className="text-sm text-slate-400">
                  No earning history yet.
                </p>
              ) : (
                data!.earningHistory.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#1f273a] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{entry.label}</p>
                      <p className="text-xs text-slate-400">Wallet entry</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-300">
                      {formatCurrency(entry.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPayments;
