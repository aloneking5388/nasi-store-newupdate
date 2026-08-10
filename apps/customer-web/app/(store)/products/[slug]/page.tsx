"use client";
import { use, useEffect } from "react";
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import RelatedProduct from "@/components/StoreComponents/RelatedProduct";
import FromShop from "@/components/StoreComponents/FromShop";
import ProductDetail from "@/components/StoreComponents/ProductDetail";
import { get_Product } from "@/store/products/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const ProductPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const dispatch = useAppDispatch();
  const { product } = useAppSelector((state) => state.product);
  const { slug } = use(params);

  useEffect(() => {
    if (slug) {
      dispatch(get_Product(slug));
    }
  }, [slug]);

  return (
    <div className="">
      <div className="max-w-360 mx-auto px-4 sm:px-5 md:px-10 lg:px-12">
        <div
          style={{ backgroundImage: 'url("/images/banner/order.jpg")' }}
          className="h-45 sm:h-55 mt-6 bg-cover bg-no-repeat relative bg-left"
        >
          <div className="absolute left-0 top-0 w-full h-full bg-[#2422228a]">
            <div className="w-full h-full mx-auto">
              <div className="flex flex-col justify-center gap-1 items-center h-full w-full text-white">
                <h2 className="text-3xl font-bold">Shop.my</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-360 mx-auto px-4 sm:px-5 md:px-10 lg:px-12">
        <div className="bg-slate-100 py-5 mb-5 px-3">
          <div className="flex justify-start items-center max-md:text-xs text-md text-slate-600 w-full">
            <Link href="/">Home</Link>
            <span className="pt-1">
              <MdOutlineKeyboardArrowRight />
            </span>
            <Link href={`/products?category=${product?.category}`}>
              {product?.category}
            </Link>
            <span className="pt-1">
              <MdOutlineKeyboardArrowRight />
            </span>
            <span>{product?.name}</span>
          </div>
        </div>
      </div>
      <section>
        <div className="max-w-360 mx-auto px-4 sm:px-5 md:px-10 lg:px-14 pb-16">
          <ProductDetail />
        </div>
      </section>
      <section>
        <div className="max-w-360 mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pb-16">
          <FromShop />
        </div>
      </section>
      <section>
        <div className="max-w-360 mx-auto px-4 sm:px-5 md:px-10 lg:px-12">
          <h2 className="text-xl font-bold py-8 text-slate-600">
            Related Products
          </h2>
          <RelatedProduct />
        </div>
      </section>
    </div>
  );
};

export default ProductPage;
