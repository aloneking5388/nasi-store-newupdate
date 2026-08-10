"use client";

import {
  admin_order_status_update,
  home_order,
  homeDashboardMessageClear,
} from "@/store/Dashboard/homeDashboardSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderDetail = () => {
  const router = useRouter();
  const { id } = useParams();
  const orderId = id as string;
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const [status, setStatus] = useState("");

  const { order, errorMessage, successMessage } = useAppSelector(
    (state) => state.homeDashboard,
  );

  useEffect(() => {
    setStatus(order?.delivery_status || "");
  }, [order]);

  const status_update = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      admin_order_status_update({
        orderId,
        info: { status: e.target.value },
      }),
    );
    setStatus(e.target.value);
  };

  useEffect(() => {
    dispatch(home_order(orderId));
  }, [orderId, dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(homeDashboardMessageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(homeDashboardMessageClear());
      router.push("/admin/orders");
    }
  }, [errorMessage, successMessage]);

  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full p-4 bg-[#283046] rounded-md">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl text-[#d0d2d6]">Order Details</h2>
          <select
            onChange={status_update}
            value={status}
            name=""
            id=""
            className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]"
          >
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="warehouse">warehouse</option>
            <option value="placed">placed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-2 text-lg text-[#d0d2d6]">
            <h2>#{order?._id}</h2>
            <span>{order?.date}</span>
          </div>
          <div className="flex max-sm:flex-col flex-wrap">
            <div className="w-[50%]">
              <div className="pr-3 text-[#d0d2d6] text-lg">
                <div className="flex flex-col gap-1">
                  <h2 className="pb-2 font-semibold">
                    Deliver to : {order?.shippingInfo?.name}
                  </h2>
                  <p>
                    <span className="text-sm">
                      {order?.shippingInfo?.address}{" "}
                      {order?.shippingInfo?.province}{" "}
                      {order?.shippingInfo?.city} {order?.shippingInfo?.area}
                    </span>
                  </p>
                </div>
                <div className="flex justify-start items-center gap-3">
                  <h2>
                    Payment Status :{" "}
                    <span className="text-base">{order?.payment_status}</span>
                  </h2>
                </div>
                <p className="text-lg">
                  Price :{" "}
                  <span className="text-sm">
                    {" "}
                    {formatCurrency(order?.price)}
                  </span>
                </p>
                <div className="mt-4 flex flex-col gap-8">
                  <div className="text-[#d0d2d6]">
                    {order?.products &&
                      order?.products.map((p: any, i: number) => (
                        <div key={i} className="flex gap-4 text-md">
                          <Image
                            src={p.images[0]}
                            alt="product image"
                            width={50}
                            height={50}
                          />
                          <div className="flex flex-col max-sm:text-xs text-sm gap-1">
                            <h2>{p.name}</h2>
                            <p className="gap-3 max-sm:flex-col flex-row flex">
                              <span>Brand : {p.brand} </span>
                              <span>Quantity : {p.quantity}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[50%]">
              <div className="pl-3">
                <div className="mt-4 flex flex-col">
                  {order?.suborder?.map((o: any, i: number) => (
                    <div key={i + 20} className="text-[#d0d2d6] mb-6">
                      <div className="flex justify-start items-center gap-3">
                        <h2>Seller {i + 1} order : </h2>
                        <span>{o.delivery_status}</span>
                      </div>
                      {Array.isArray(o.products) &&
                        o.products.map((p: any, j: number) => (
                          <div className="flex gap-3 text-md mt-2" key={j}>
                            {Array.isArray(p.images) && p.images.length > 0 && (
                              <Image
                                width={45}
                                height={45}
                                src={p.images[0]}
                                alt="product image"
                              />
                            )}
                            <div className="flex flex-col text-sm ">
                              <h2>{p.name}</h2>
                              <p className="flex flex-col gap-1">
                                <span>Brand : {p.brand} </span>
                                <span>Quantity : {p.quantity}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

