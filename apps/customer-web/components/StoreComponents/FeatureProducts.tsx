"use client";
import { useAppSelector } from "@/store/hooks";
import DynamicProductList from "./DynamicProductList";

const FeatureProducts = () => {
    const { products, loader } = useAppSelector((state) => state.home)
  return (
    <div>
      <DynamicProductList
        products={products}
        loader={loader}
        layout="grid"
        showTitle={true}
        titleText="Featured Products"
        showDiscount={true}
      />
    </div>
  );
};

export default FeatureProducts;
