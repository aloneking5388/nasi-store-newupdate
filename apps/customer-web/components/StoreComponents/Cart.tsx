"use client";

import {
  cartMessageClear,
  deleteCartItem,
  getCartItems,
  quantity_dec,
  quantity_inc,
  setShippingDetails,
} from "@/store/cart/cartSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CartGroup, CartProduct } from "@nasi/types/cart";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const Cart = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  const { userInfo } = useAppSelector((state) => state.auth);
  const {
    cartItems,
    successMessage,
    price,
    tax,
    totalWithTax,
    buyProductItem,
    outOfStockProducts,
  } = useAppSelector((state) => state.cart);

  useEffect(() => {
    if (userInfo?.id) {
      dispatch(getCartItems({ id: userInfo.id }));
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(cartMessageClear());
      if (userInfo?.id) {
        dispatch(getCartItems({ id: userInfo.id }));
      }
    }
  }, [successMessage, dispatch, userInfo]);

  const inc = (quantity: number, stock: number, card_id: string) => {
    if (quantity + 1 <= stock) {
      dispatch(quantity_inc(card_id));
    }
  };

  const dec = (quantity: number, card_id: string) => {
    if (quantity > 1) {
      dispatch(quantity_dec(card_id));
    }
  };

  const redirect = () => {
    dispatch(
      setShippingDetails({
        products: cartItems,
        price: price,
        tax,
        total: totalWithTax,
        items: buyProductItem,
      }),
    );
    router.push("/shipping");
  };

  return (
    <div className="max-w-360 mx-auto px-5 lg:px-12 md:px-10 py-16">
      {cartItems.length > 0 || outOfStockProducts.length > 0 ? (
        <div className="flex flex-wrap">
          {/* Left Side - Cart Items */}
          <div className="w-full lg:w-[67%] pr-0 md:pr-3">
            <div className="flex flex-col gap-3">
              {cartItems.map((group: CartGroup, i: number) => (
                <div
                  key={group._id || `cart-group-${i}`}
                  className="flex bg-slate-100 rounded-md p-4 flex-col gap-2 border"
                >
                  <div className="flex justify-start items-center">
                    <h2 className="text-md text-slate-600">{group.shopName}</h2>
                  </div>

                  {group.products.map((product: CartProduct, i: number) => (
                    <div
                      key={product._id || `cart-${i}`}
                      className={`w-full flex flex-wrap ${
                        group.products[group.products.length - 1]._id !==
                        product._id
                          ? "border-b pb-3"
                          : ""
                      }`}
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

                      <div className="flex justify-between max-md:flex-col  max-md:w-5/12 w-full sm:mt-3">
                        <div className="flex max-md:flex-row gap-3 pl-4 max-sm:pl-0">
                          <p className="line-through">
                            {formatCurrency(product.productInfo.price)}
                          </p>
                          <p>-{product.productInfo.discount}%</p>
                        </div>
                        <div className="">
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
                        <div className="flex gap-2 flex-col ">
                          <div className="flex max-md:text-lg rounded-md bg-slate-200 h-7.5 justify-center items-center text-xl">
                            <div
                              onClick={() => dec(product.quantity, product._id)}
                              className="px-3 cursor-pointer"
                            >
                              -
                            </div>
                            <div className="px-3">{product.quantity}</div>
                            <div
                              onClick={() =>
                                inc(
                                  product.quantity,
                                  product.productInfo.stock,
                                  product._id,
                                )
                              }
                              className="px-3 cursor-pointer"
                            >
                              +
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              dispatch(deleteCartItem(product._id))
                            }
                            className="px-5 rounded-md py-0.75 bg-red-500 text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {outOfStockProducts.length > 0 && (
                <div className="flex bg-slate-100 rounded-md p-4 flex-col gap-2 border">
                  <div className="flex justify-start items-center">
                    <h2 className="text-md text-red-500 font-semibold">
                      Out of Stock ({outOfStockProducts.length})
                    </h2>
                  </div>

                  <div className="p-4">
                    {outOfStockProducts.map((p: CartProduct, i: number) => (
                      <div
                        key={p._id || `out-${i}`}
                        className="w-full flex flex-wrap"
                      >
                        <div className="flex max-md:flex-col w-full gap-2 max-md:w-7/12">
                          <div className="flex max-md:flex-col gap-2 justify-start items-center">
                            <Image
                              className="w-20 h-20 object-cover"
                              src={p.products[0].images[0]}
                              alt={`Image of ${p.products[0].name}`}
                              width={80}
                              height={80}
                            />
                            <div className="pr-4 text-slate-600">
                              <h2 className="text-md">{p.products[0].name}</h2>
                              <span className="text-sm">
                                Brand : {p.products[0].brand}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between max-md:flex-col  max-md:w-5/12 w-full sm:mt-3">
                          <div className="flex max-md:flex-row gap-3 pl-4 max-sm:pl-0">
                            <p className="line-through">
                              {formatCurrency(p.products[0].price)}
                            </p>
                            <p>-{p.products[0].discount}%</p>
                          </div>
                          <div className="">
                            <h2 className="text-lg font-bold text-orange-500">
                              {formatCurrency(
                                p.products[0].price -
                                  Math.floor(
                                    (p.products[0].price *
                                      p.products[0].discount) /
                                      100,
                                  ),
                              )}{" "}
                            </h2>
                          </div>
                          <div className="flex gap-2 flex-col">
                            <div className="flex max-md:text-lg rounded-md bg-slate-200 h-7.5 justify-center items-center text-xl">
                              <div
                                onClick={() => dec(p.quantity, p._id)}
                                className="px-3 cursor-pointer"
                              >
                                -
                              </div>
                              <div className="px-3">{p.quantity}</div>
                              <div
                                onClick={() =>
                                  inc(p.quantity, p.products[0].stock, p._id)
                                }
                                className="px-3 cursor-pointer"
                              >
                                +
                              </div>
                            </div>
                            <button
                              onClick={() => dispatch(deleteCartItem(p._id))}
                              className="px-5 rounded-md py-0.75 bg-red-500 text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Summary */}
          <div className="lg:w-[33%] w-full pl-3 max-md:pl-0 max-md:mt-5">
            {cartItems.length > 0 && (
              <div className="bg-slate-100 rounded-md p-3 text-slate-600 flex flex-col gap-3 border">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <div className="flex justify-between items-center">
                  <span>{buyProductItem} Item</span>
                  <span>{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>18% Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    className="w-full bg-white max-md:text-xs px-3 py-2 border border-slate-400 outline-0 focus:border-green-500 rounded-sm"
                    type="text"
                    placeholder="Input Voucher Coupon"
                  />
                  <button className="px-5 py-px bg-blue-500 text-white max-md:text-xs rounded-sm uppercase text-sm">
                    Apply
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total</span>
                  <span className="text-lg text-orange-500">
                    {formatCurrency(totalWithTax)}
                  </span>
                </div>
                <button
                  onClick={redirect}
                  className="px-5 py-1.5 rounded-sm hover:shadow-orange-500/20 hover:shadow-lg bg-orange-500 text-sm text-white uppercase"
                >
                  Proceed to checkout {buyProductItem}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl text-slate-600 mb-4">Your cart is empty!</h2>
          <Link
            className="px-4 py-2 bg-indigo-500 text-white rounded"
            href="/shop"
          >
            Shop Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
