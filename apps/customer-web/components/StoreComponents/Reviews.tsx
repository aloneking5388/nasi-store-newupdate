"use client";

import { Product } from "@nasi/types/product";
import Pagination from "@/components/DashboardComponents/Pagination";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Rating from "./Retings";
import StarRating from "@/components/ui/StarRating";
import {
  customer_review,
  get_review,
  reviewMessageClear,
} from "@/store/Review/reviewSlice";

const Reviews = ({ product }: { product: Product | null }) => {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { successMessage, reviews, totalReview, rating_review } =
    useAppSelector((state) => state.review);

  const [pageNumber, setPageNumber] = useState(1);
  const [rat, setRat] = useState(0);
  const [re, setRe] = useState("");

  const review_submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const obj = {
      name: userInfo?.name || "",
      review: re,
      rating: rat,
      productId: product?.id || "",
    };
    dispatch(customer_review(obj));
  };

  useEffect(() => {
    if (product?.id) {
      dispatch(
        get_review({
          productId: product.id,
          pageNumber,
        }),
      );
    }
  }, [product?.id, dispatch]);

  useEffect(() => {
    if (successMessage && product?.id) {
      toast.success(successMessage);
      setRe("");
      setRat(0);
      dispatch(
        get_review({
          productId: product.id,
          pageNumber,
        }),
      );
      dispatch(reviewMessageClear());
    }
  }, [successMessage, product?.id, pageNumber, dispatch]);

  return (
    <div className="mt-8 max-sm:mt-2">
      <div className="flex gap-10 max-sm:gap-1 flex-col md:flex-row">
        {/* Left Rating Summary */}
        <div className="flex flex-col gap-2 justify-start items-start py-4">
          <div>
            <span className="text-6xl max-sm:text-3xl font-semibold">
              {product?.rating}
            </span>
            <span className="text-3xl max-sm:text-xl font-semibold text-slate-600">
              /5
            </span>
          </div>
          <div className="flex max-sm:text-2xl text-4xl">
            <Rating size="small" type="precise" rating={product?.rating} />
          </div>
          <p className="text-sm text-slate-600">{totalReview} Reviews</p>
        </div>

        {/* Rating Bars */}
        <div className="flex gap-2 flex-col py-4">
          {[5, 4, 3, 2, 1].map((rate, index) => (
            <div key={rate} className="flex items-center gap-5">
              <div className="text-md mr-2 flex gap-1 w-[93px]">
                <Rating size="medium" type="display" rating={rate} />
              </div>
              <div className="w-[200px] h-[14px] bg-slate-200 relative">
                <div
                  style={{
                    width: `${Math.floor(
                      (100 * (rating_review[index]?.sum || 0)) / totalReview,
                    )}%`,
                  }}
                  className="h-full bg-[#EDBB0E]"
                ></div>
              </div>
              <p className="text-sm text-slate-600 min-w-[20px]">
                {rating_review[index]?.sum || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <h2 className="text-slate-600 text-xl font-bold py-5">
        Product Reviews ({totalReview})
      </h2>
      <div className="flex flex-col gap-8 pb-10 pt-4">
        {reviews.map((r, index) => (
          <div key={r.id || index} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="flex gap-1 text-xl">
                <Rating size="medium" type="display" rating={r.rating} />
              </div>
              <span className="text-slate-600">{r.date}</span>
            </div>
            <span className="text-slate-600 text-md">{r.name}</span>
            <p className="text-slate-600 text-sm">{r.review}</p>
          </div>
        ))}

        {/* Pagination */}
        {totalReview > 5 && (
          <div className="flex justify-end">
            <Pagination
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              totalItem={totalReview}
              perPage={5}
              showItem={Math.round(totalReview / 5)}
            />
          </div>
        )}
      </div>

      {/* Review Form */}
      <div>
        {userInfo ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-1">
              <StarRating value={rat} onChange={setRat} />
            </div>
            <form onSubmit={review_submit}>
              <textarea
                value={re}
                required
                onChange={(e) => setRe(e.target.value)}
                className="border outline-0 p-3 w-full"
                rows={5}
              />
              <div className="mt-2">
                <button
                  type="submit"
                  className="py-1 px-5 bg-indigo-500 text-white rounded-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <Link
              className="py-1 px-5 bg-indigo-500 text-white rounded-sm"
              href="/login"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
