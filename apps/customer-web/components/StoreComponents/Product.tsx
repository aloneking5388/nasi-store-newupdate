"use client";
import { useAppSelector } from "@/store/hooks";
import Products from "./Products";

const Product = () => {
  const { latest_product, topRated_product, discount_product, loader } =
    useAppSelector((state) => state.home);
  return (
    <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      <div className="overflow-hidden">
        <Products
          title="Latest Product"
          products={latest_product}
          loader={loader}
        />
      </div>
      <div className="overflow-hidden">
        <Products
          title="Top Rated Product"
          products={topRated_product}
          loader={loader}
        />
      </div>
      <div className="overflow-hidden">
        <Products
          title="Discount Product"
          products={discount_product}
          loader={loader}
        />
      </div>
    </div>
  );
};

export default Product;
