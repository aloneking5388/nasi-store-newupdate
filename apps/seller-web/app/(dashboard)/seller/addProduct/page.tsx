import Link from "next/link";
import AddProductForm from "@/components/SellerComponents/AddProductForm";

const AddProducts = () => {
  return (
    <div className="px-2 lg:px-7 pt-5 ">
      <div className="w-full p-4  bg-[#283046] rounded-md">
        <div className="flex justify-between items-center pb-4">
          <h1 className="text-[#d0d2d6] text-xl font-semibold">Add Product</h1>
          <Link
            className="bg-blue-500 hover:shadow-blue-500/50 hover:shadow-lg text-white rounded-sm px-7 py-2 my-2 "
            href="/seller/allproducts"
          >
            Products
          </Link>
        </div>
        <AddProductForm />
      </div>
    </div>
  );
};

export default AddProducts;