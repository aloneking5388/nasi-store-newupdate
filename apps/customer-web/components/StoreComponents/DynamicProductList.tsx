"use client";

import { AiFillHeart, AiOutlineShoppingCart } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  addToCart,
  addToWishlist,
  cartMessageClear,
} from "@/store/cart/cartSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import Rating from "./Retings";
import SkeletonProductCard from "@/components/Skeletons/SkeletonProductCard";

interface DynamicProductListProps {
  products: any[];
  loader?: boolean; // to show skeletons
  layout?: "grid" | "list"; // controls grid or vertical
  showTitle?: boolean;
  titleText?: string;
  showDiscount?: boolean;
}

const DynamicProductList = ({
  products,
  loader = false,
  layout = "grid",
  showTitle = false,
  titleText = "Featured Products",
  showDiscount = true,
}: DynamicProductListProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { successMessage, errorMessage } = useAppSelector(
    (state) => state.cart,
  );
  const { userInfo } = useAppSelector((state) => state.auth);

  const redirectToLogin = () => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
    } else {
      router.push("/login");
    }
  };

  const handleAddToCart = (id: string) => {
    if (userInfo) {
      dispatch(addToCart({ userId: userInfo.id, quantity: 1, productId: id }));
    } else {
      redirectToLogin();
    }
  };

  const handleAddToWishlist = (product: any) => {
    if (userInfo) {
      dispatch(
        addToWishlist({
          userId: userInfo.id,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          discount: product.discount,
          rating: product.rating,
          slug: product.slug,
        }),
      );
    } else {
      redirectToLogin();
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(cartMessageClear());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(cartMessageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

  return (
    <div className="w-full mx-auto">
      {showTitle && (
        <div className="text-center text-lg lg:text-4xl text-slate-600 font-bold max-sm:pb-3 lg:pb-12">
          <h2>{titleText}</h2>
          <div className="w-24 h-1 bg-[#7fad39] mx-auto max-sm:mt-2 mt-4" />
        </div>
      )}

      <div
        className={`w-full ${
          layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            : "flex flex-col gap-4"
        }`}
      >
        {loader
          ? Array.from({ length: 10 }).map((_, index) => (
              <SkeletonProductCard key={index} layout={layout} />
            ))
          : products.map((product, index) => (
              <Card
                key={product._id || product.slug || index}
                className={`group bg-slate-100 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden ${
                  layout === "list"
                    ? "flex flex-col sm:flex-row sm:items-center"
                    : ""
                }`}
              >
                <div
                  className={`relative flex justify-center items-center p-2 ${
                    layout === "list" ? "w-full sm:w-[60%] h-45" : ""
                  }`}
                >
                  {showDiscount && product.discount > 0 && (
                    <span className="absolute top-2 left-2 z-20 text-white text-xs font-semibold bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                      {product.discount}%
                    </span>
                  )}

                  <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 112px, 128px"
                      className="object-contain"
                    />
                  </div>

                  <ul className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <li
                      onClick={() => handleAddToWishlist(product)}
                      className="w-9 h-9 bg-white hover:bg-pink-500 text-black hover:text-white rounded-full flex justify-center items-center cursor-pointer transition-transform hover:rotate-360"
                    >
                      <AiFillHeart />
                    </li>
                    <Link
                      href={`/products/${product.slug}`}
                      className="w-9 h-9 bg-white hover:bg-[#7fad39] text-black hover:text-white rounded-full flex justify-center items-center transition-transform hover:rotate-360"
                    >
                      <FaEye />
                    </Link>
                    <li
                      onClick={() => handleAddToCart(product._id)}
                      className="w-9 h-9 bg-white hover:bg-blue-500 text-black hover:text-white rounded-full flex justify-center items-center cursor-pointer transition-transform hover:rotate-360"
                    >
                      <AiOutlineShoppingCart />
                    </li>
                  </ul>
                  <li
                    onClick={() => handleAddToWishlist(product)}
                    className="absolute top-2 right-2 sm:hidden w-9 h-9 bg-white text-pink-500 hover:bg-pink-500 hover:text-white rounded-full flex justify-center items-center z-10"
                  >
                    <AiFillHeart />
                  </li>
                </div>

                <CardContent className="px-3 lg:px-4 py-2 text-center text-sm font-semibold text-gray-700">
                  <h3 className="truncate leading-5">{product.name}</h3>

                  <div className="flex justify-center items-center gap-2 mt-1">
                    <span className="text-base font-bold text-black">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <div className="flex justify-center mt-1">
                    <Rating
                      size="small"
                      type="precise"
                      rating={product?.rating}
                    />
                  </div>

                  <div className="flex justify-between items-center gap-2 mt-2 sm:hidden">
                    <Link
                      href={`/products/${product.slug}`}
                      className="w-8 h-8 bg-green-500 text-white rounded-full flex justify-center items-center mb-1"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex justify-center items-center mb-1"
                    >
                      <AiOutlineShoppingCart size={18} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default DynamicProductList;
