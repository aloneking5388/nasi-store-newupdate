"use client";
import { get_order } from "@/store/Order/orderSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { myOrder } = useAppSelector((state) => state.order);
  const { userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(get_order(orderId as string));
  }, [orderId, dispatch]);

  return (
    <div className="bg-white rounded-md p-5">
      <h2 className="flex flex-col text-slate-600 font-semibold">
        #{myOrder?._id}
        <span className="pl-1">{myOrder?.date}</span>
      </h2>
      <div className="grid mt-2 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-slate-600 font-semibold">
            Deliver to: {myOrder?.shippingInfo?.name}
          </h2>
          <p>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              Home
            </span>
            <span className="text-slate-600 text-sm">
              {myOrder?.shippingInfo.address} {myOrder?.shippingInfo.province}{" "}
              {myOrder?.shippingInfo.city} {myOrder?.shippingInfo.area}
            </span>
          </p>
          <p className="text-slate-600 text-sm font-semibold">
            Email to {userInfo?.email}
          </p>
        </div>
        <div className="text-slate-600 flex flex-col gap-2">
          <h2 className="text-lg font-bold">
            Total Price: {formatCurrency(myOrder?.price)}
            <span className="text-xs ml-2 text-slate-500 font-normal">
              include Tax and Shipping Fee
            </span>
          </h2>
          <p>
            Payment status:{" "}
            <span
              className={`py-0.5 text-xs px-3 ${
                myOrder?.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              } rounded-md `}
            >
              {myOrder?.payment_status}
            </span>
          </p>
          <p>
            Order status:{" "}
            <span
              className={`py-0.5 text-xs px-3 ${
                myOrder?.delivery_status === "pending"
                  ? "bg-red-100 text-red-800"
                  : "bg-indigo-100 text-indigo-800"
              } rounded-md `}
            >
              {myOrder?.delivery_status}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-3">
        <h2 className="text-slate-600 text-lg pb-2">Products</h2>
        <div className="flex gap-5 flex-col">
          {myOrder?.products.map((p, i) => (
            <div key={p.productId || i}>
              <div className="flex gap-5 justify-start items-center text-slate-600">
                <div className="flex gap-2">
                  <Image src={p.images[0]} alt="image" width={55} height={55} />
                  <div className="flex text-sm flex-col font-semibold justify-start items-start">
                    <h2>Name: {p.name}</h2>
                    <div className="flex flex-col text-slate-500">
                      <p>Brand: {p.brand}</p>
                      <p>Quantity: {p.quantity}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col pl-4">
                  <p>Price: {formatCurrency(p.price)}</p>
                  <p>Discount: -{p.discount}%</p>
                  <h2 className="text-md font-extrabold text-orange-500">
                    {formatCurrency(
                      p.price - Math.floor((p.price * p.discount) / 100),
                    )}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
