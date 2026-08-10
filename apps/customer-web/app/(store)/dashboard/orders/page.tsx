"use client";
import { get_orders, setOrderDetails } from "@/store/Order/orderSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const OrdersPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { myOrders } = useAppSelector((state) => state.order);
  const [state, setState] = useState("all");

  useEffect(() => {
    dispatch(get_orders({ customerId: userInfo?.id ?? "", status: state }));
  }, [state]);

  const redirect = (ord: any) => {
    let items = 0;
    for (let i = 0; i < ord.length; i++) {
      items = ord.products[i].quantity + items;
    }
    dispatch(
      setOrderDetails({
        totalPrice: ord.totalPrice,
        items,
        orderId: ord._id,
      }),
    );
    router.push("/payment");
  };
  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex justify-between items-center">
        <h2 className="text-xl max-md:text-lg font-semibold text-slate-600">
          My Orders
        </h2>
        <select
          className="outline-none max-md:text-sm px-3 py-1 border rounded-md text-slate-600"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="all">--order status---</option>
          <option value="placed">Placed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="warehouse">Warehouse</option>
        </select>
      </div>
      <div className="pt-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm max-md:text-xs text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                >
                  Order Id
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                >
                  Payment status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                >
                  Order status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((ord: any, i) => (
                <tr key={ord._id || i} className="bg-white border-b">
                  <td
                    scope="row"
                    className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                  >
                    {ord._id}
                  </td>
                  <td
                    scope="row"
                    className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                  >
                    {formatCurrency(ord.price)}
                  </td>
                  <td
                    scope="row"
                    className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                  >
                    {ord.payment_status}
                  </td>
                  <td
                    scope="row"
                    className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                  >
                    {ord.delivery_status}
                  </td>
                  <td
                    scope="row"
                    className="px-6 py-3 whitespace-nowrap text-[13px] max-md:px-2 max-md:text-[10px]"
                  >
                    <Link href={`/dashboard/orders/${ord._id}`}>
                      <span className="bg-green-100 text-green-800 text-sm max-md:text-[8px] font-normal mr-2 px-2.5 max-md:px-1 py-px rounded">
                        view
                      </span>
                    </Link>
                    {ord.payment_status !== "paid" && (
                      <span
                        onClick={() => redirect(ord)}
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
  );
};

export default OrdersPage;
