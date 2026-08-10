"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { home_orders } from "@/store/Dashboard/homeDashboardSlice";
import { formatPrice } from "@/utils/formatPrice";
// Adjust path if needed

const Orderlist = () => {
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { orders, loader, errorMessage } = useAppSelector(
    (state) => state.homeDashboard,
  );

  useEffect(() => {
    dispatch(
      home_orders({
        page: 1,
        parPage: 5,
        searchValue: "",
      }),
    );
  }, [dispatch]);

  return (
    <Card className="bg-[#283046] text-[#d0d2d6]">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium">
            View All
          </Link>
        </div>

        {loader && <p className="text-sm">Loading orders...</p>}
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

        {!loader && orders.length === 0 && (
          <p className="text-sm">No orders found.</p>
        )}

        {!loader && orders.length > 0 && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-[#d0d2d6] text-sm">
              <thead className="uppercase border-b border-slate-700">
                <tr>
                  <th className="py-2 px-3">Order ID</th>
                  <th className="py-2 px-3">Price</th>
                  <th className="py-2 px-3">Payment Status</th>
                  <th className="py-2 px-3">Order Status</th>
                  <th className="py-2 px-3">Active</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-slate-700 hover:bg-slate-800 transition"
                  >
                    <td className="py-2 px-3 font-medium whitespace-nowrap">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="py-2 px-3 font-medium whitespace-nowrap">
                      {formatCurrency(order.price)}
                    </td>
                    <td className="py-2 px-3 font-medium whitespace-nowrap">
                      {order.payment_status || "N/A"}
                    </td>
                    <td className="py-2 px-3 font-medium whitespace-nowrap capitalize">
                      {order.delivery_status || "N/A"}
                    </td>
                    <td className="py-2 px-3 font-medium whitespace-nowrap">
                      <Link
                        href={`/${
                          userInfo?.role === "admin" ? "admin" : "seller"
                        }/orders/${order._id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Orderlist;
