"use client";

import Rating from "@/components/StoreComponents/Retings";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import {
  cartMessageClear,
  deleteWishlistItem,
  getWishlistItems,
} from "@/store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { AiFillDelete, AiOutlineShoppingCart } from "react-icons/ai";
import { FaEye } from "react-icons/fa";

const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { wishlistItems, successMessage } = useAppSelector(
    (state) => state.cart,
  );

  useEffect(() => {
    if (userInfo?.id) {
      dispatch(getWishlistItems({ id: userInfo.id }));
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(cartMessageClear());
      if (userInfo?.id) {
        dispatch(getWishlistItems({ id: userInfo.id }));
      }
    }
  }, [successMessage, dispatch, userInfo]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 gap-6">
      {wishlistItems.map((p, i) => (
        <div
          key={i}
          className="flex flex-col justify-center items-center border rounded-md group transition-all duration-500 hover:shadow-md hover:-mt-3 bg-white"
        >
          <div className="relative overflow-hidden">
            {p.discount !== 0 && (
              <div className="flex justify-center items-center absolute text-white w-9.5 h-9.5 rounded-full bg-red-500 font-semibold text-xs left-2 top-2">
                {p.discount}%
              </div>
            )}

            <Image
              className="flex justify-center items-center"
              src={p.image}
              alt="product image"
              width={200}
              height={200}
            />
            <ul className="flex transition-all duration-700 -bottom-10 max-sm:bottom-px justify-center items-center gap-2 absolute w-full group-hover:bottom-3">
              <li
                onClick={() => dispatch(deleteWishlistItem(p._id))}
                className="w-9.5 h-9.5 max-sm:w-7 max-sm:h-7 max-sm:text-[10px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-red-500 hover:text-white hover:rotate-720 transition-all"
              >
                <AiFillDelete />
              </li>
              <Link
                href={`/product/details/${p.slug}`}
                className="w-9.5 h-9.5 max-sm:w-7 max-sm:h-7 max-sm:text-[10px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#7fad39] hover:text-white hover:rotate-720 transition-all"
              >
                <FaEye />
              </Link>
              <li className="w-9.5 h-9.5 max-sm:w-7 max-sm:h-7 max-sm:text-[10px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#7fad39] hover:text-white hover:rotate-720 transition-all">
                <AiOutlineShoppingCart />
              </li>
            </ul>
          </div>
          <div className="py-3 text-slate-600 px-2">
            <h2>{p.name}</h2>
            <div className="flex justify-start items-center gap-3">
              <span className="text-lg  font-bold">
                {formatCurrency(p.price)}
              </span>
              <div className="flex">
                <Rating size="small" type="precise" rating={p.rating} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistPage;
