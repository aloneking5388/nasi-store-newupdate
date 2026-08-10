"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Card, CardContent } from "../ui/card";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import Pagination from "./Pagination";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { home_orders } from "@/store/Dashboard/homeDashboardSlice";
import { formatPrice } from "@/utils/formatPrice";

const OrderTable = () => {
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { totalOrders, orders, loader, errorMessage } = useAppSelector(
    (state) => state.homeDashboard,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(5);
  const [show, setShow] = useState("");

  useEffect(() => {
    dispatch(home_orders({ page: currentPage, parPage, searchValue }));
  }, [currentPage, parPage, searchValue, dispatch]);

  return (
    <Card className="bg-[#283046] text-[#d0d2d6] p-4">
      <CardContent>
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <Select
            onValueChange={(val) => setParPage(Number(val))}
            defaultValue="5"
          >
            <SelectTrigger className="w-full md:w-28 text-white border-slate-700 bg-[#1e2532]">
              {parPage}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full md:max-w-xs bg-[#1e2532] border-slate-700 text-white"
          />
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-sm text-[#d0d2d6]">
            <thead className="uppercase border-b border-slate-700">
              <tr>
                <th className="py-2 px-3">Order ID</th>
                <th className="py-2 px-3">Price</th>
                <th className="py-2 px-3">Payment Status</th>
                <th className="py-2 px-3">Order Status</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {loader && (
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-sm">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!loader && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-sm">
                    No orders found.
                  </td>
                </tr>
              )}

              {!loader &&
                orders.map((order) => (
                  <Fragment key={order._id}>
                    <tr className="border-t border-slate-700 hover:bg-slate-800 transition">
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
                      <td
                        className="py-2 px-3 font-medium whitespace-nowrap cursor-pointer text-right"
                        onClick={() =>
                          setShow(show === order._id ? "" : order._id)
                        }
                      >
                        <MdKeyboardArrowDown className="inline" />
                      </td>
                    </tr>

                    {/* Suborders */}
                    {Array.isArray(order.suborder) &&
                      order.suborder.length > 0 &&
                      show === order._id && (
                        <tr className="bg-slate-800 border-t border-slate-700">
                          <td colSpan={6}>
                            <table className="w-full text-left text-sm text-[#d0d2d6] mt-2">
                              <thead>
                                <tr>
                                  <th className="py-1 px-3">Suborder ID</th>
                                  <th className="py-1 px-3">Price</th>
                                  <th className="py-1 px-3">Payment</th>
                                  <th className="py-1 px-3">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.suborder.map((so, j) => (
                                  <tr
                                    key={so._id || j}
                                    className="border-t border-slate-700"
                                  >
                                    <td className="py-1 px-3">{so._id}</td>
                                    <td className="py-1 px-3">
                                      {formatCurrency(so.price)}
                                    </td>
                                    <td className="py-1 px-3">
                                      {so.payment_status}
                                    </td>
                                    <td className="py-1 px-3">
                                      {so.delivery_status}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalOrders > parPage && (
          <div className="flex justify-end mt-4">
            <Pagination
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
              totalItem={totalOrders}
              parPage={parPage}
              showItem={4}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTable;
