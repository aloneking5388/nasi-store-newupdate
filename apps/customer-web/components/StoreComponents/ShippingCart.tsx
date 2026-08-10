"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ShippingForm from "./ShippingForm";
import { CartGroup, CartProduct } from "@nasi/types/cart";
import {
  orderMessageClear,
  place_order,
  setOrderDetails,
} from "@/store/Order/orderSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { formatPrice } from "@/utils/formatPrice";

const ShippingCart = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const [shippingMethodMap, setShippingMethodMap] = useState<{
    [sellerId: string]: "pickup" | "home delivery";
  }>({});

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
    post: "",
    province: "",
    city: "",
    area: "",
  });

  const { userInfo } = useAppSelector((state) => state.auth);
  const { items, total, price, tax, products } = useAppSelector(
    (state) => state.cart.shippingDetails,
  );
  const { loader } = useAppSelector((state) => state.order);

  const isFormComplete = Object.values(shippingInfo).every(
    (value) => value.trim() !== "",
  );

  useEffect(() => {
    const defaultMethods: { [key: string]: "pickup" | "home delivery" } = {};
    products.forEach((group: CartGroup) => {
      defaultMethods[group.sellerId] = "home delivery";
    });
    setShippingMethodMap(defaultMethods);
  }, [products]);

  const handleShippingMethodChange = (
    sellerId: string,
    method: "pickup" | "home delivery",
  ) => {
    setShippingMethodMap((prev) => ({
      ...prev,
      [sellerId]: method,
    }));
  };

  const calculatedShippingFee = products.reduce(
    (total: number, group: CartGroup) => {
      const method = shippingMethodMap[group.sellerId] || "home delivery";
      const groupPrice = group.products.reduce(
        (sum: number, product: CartProduct) => sum + product.productInfo.price,
        0,
      );

      if (method === "home delivery" && groupPrice < 50000) {
        return total + 1000;
      }

      return total;
    },
    0,
  );

  const handlePlaceOrder = () => {
    if (!userInfo?.id) {
      toast.error("Please login to place an order");
      return;
    }

    dispatch(
      place_order({
        price: total,
        products,
        shippingFee: calculatedShippingFee,
        shippingInfo,
        userId: userInfo.id,
        items,
        shippingMethodMap,
      }),
    )
      .unwrap()
      .then((res) => {
        dispatch(
          setOrderDetails({
            orderId: res.orderId,
            totalPrice: total + calculatedShippingFee,
            items,
          }),
        );
        toast.success(res.message);
        dispatch(orderMessageClear());
        router.push("/payment");
      })
      .catch((error) =>
        toast.error(
          error?.message || "An error occurred while placing the order",
        ),
      );
  };

  return (
    <section className="bg-[#eeeeee]">
      <div className="max-w-360 mx-auto lg:px-12 px-10 py-16">
        <div className="w-full flex flex-wrap">
          <div className="w-[67%] max-md:w-full">
            <div className="flex flex-col gap-3">
              <ShippingForm state={shippingInfo} setState={setShippingInfo} />

              {products.map((group: CartGroup, i: number) => (
                <div
                  key={group._id || `cart-group-${i}`}
                  className="flex bg-white rounded-md p-4 flex-col gap-2 border"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-md text-slate-600">{group.shopName}</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleShippingMethodChange(group.sellerId, "pickup")
                        }
                        className={`px-3 py-1 rounded ${
                          shippingMethodMap[group.sellerId] === "pickup"
                            ? "bg-orange-500 text-white"
                            : "bg-white text-gray-600 border"
                        }`}
                      >
                        Pickup
                      </button>
                      <button
                        onClick={() =>
                          handleShippingMethodChange(
                            group.sellerId,
                            "home delivery",
                          )
                        }
                        className={`px-3 py-1 rounded ${
                          shippingMethodMap[group.sellerId] === "home delivery"
                            ? "bg-orange-500 text-white"
                            : "bg-white text-gray-600 border"
                        }`}
                      >
                        Home Delivery
                      </button>
                    </div>
                  </div>

                  {group.products.map((product: CartProduct, j: number) => (
                    <div
                      key={product._id || `cart-${j}`}
                      className="w-full flex flex-wrap"
                    >
                      <div className="flex max-md:flex-col w-full gap-2 max-md:w-7/12">
                        <div className="flex max-md:flex-col gap-2 justify-start items-center">
                          <Image
                            className="w-20 h-20 object-cover"
                            src={product.productInfo.images[0]}
                            alt="product image"
                            width={80}
                            height={80}
                          />
                          <div className="pr-4 text-slate-600">
                            <h2 className="text-md">
                              {product.productInfo.name}
                            </h2>
                            <span className="text-sm">
                              Brand: {product.productInfo.brand}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center flex-col max-md:w-5/12 w-full sm:mt-3">
                        <div className="flex max-md:flex-row gap-3 pl-4 max-sm:pl-0">
                          <p className="line-through">
                            {formatCurrency(product.productInfo.price)}
                          </p>
                          <p>-{product.productInfo.discount}%</p>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-orange-500">
                            {formatCurrency(
                              product.productInfo.price -
                                Math.floor(
                                  (product.productInfo.price *
                                    product.productInfo.discount) /
                                    100,
                                ),
                            )}
                          </h2>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="w-[33%] max-md:mt-4 max-md:w-full">
            <div className="pl-3 max-md:pl-0">
              <div className="bg-white rounded-md font-medium p-5 text-slate-600 flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Order Summary</h2>

                <div className="flex justify-between items-center">
                  <span>Items</span>
                  <span>{items}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Items Total</span>
                  <span>{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(calculatedShippingFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>18% Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Payment</span>
                  <span>{formatCurrency(total + calculatedShippingFee)}</span>
                </div>

                <button
                  disabled={!isFormComplete || loader}
                  onClick={handlePlaceOrder}
                  className={`px-5 py-1.5 rounded-sm hover:shadow-orange-500/20 hover:shadow-lg ${
                    isFormComplete ? "bg-orange-500" : "bg-orange-300"
                  } text-sm text-white uppercase`}
                >
                  {loader ? (
                    <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShippingCart;
