"use client";

import ProductTable from "@/components/SellerComponents/ProductTable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteProduct, getSellerProducts, productMessageClear } from "@/store/products/productSlice";

const AllProducts = () => {
  const dispatch = useAppDispatch();
  const { sellerProducts, totalSellerProduct, errorMessage, successMessage } =
    useAppSelector((state) => state.product);

  const handleDelete = (id: string) => {
    dispatch(deleteProduct(id));
  };

  return (
    <div className="px-2 lg:px-7 pt-5">
      <ProductTable
        products={sellerProducts}
        totalProducts={totalSellerProduct}
        fetchFunction={(obj) => dispatch(getSellerProducts(obj))}
        onDelete={handleDelete}
        successMessage={successMessage}
        errorMessage={errorMessage}
        clearMessage={() => dispatch(productMessageClear())}
      />
    </div>
  );
};

export default AllProducts;
