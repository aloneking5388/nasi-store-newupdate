"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  getProduct,
  productImageUpdate,
  productMessageClear,
  updateProduct,
} from "@/store/products/productSlice";
import { get_category } from "@/store/Categoris/categorySlice";
import FormInput from "@/components/DashboardComponents/FormInput";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

type CategoryOption = {
  name: string;
  subcategories?: string[];
};

const UpdateProduct = () => {
  const router = useRouter();
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const { Id } = useParams();
  const productId = Id as string;
  const dispatch = useAppDispatch();
  const { categorys } = useAppSelector((state) => state.category);
  const { product, loader, errorMessage, successMessage } = useAppSelector(
    (state) => state.product,
  );

  useEffect(() => {
    dispatch(
      get_category({
        searchValue: "",
        parPage: 0,
        page: 0,
      }),
    );
  }, []);

  const [state, setState] = useState({
    name: "",
    description: "",
    discount: 0,
    price: 0,
    brand: "",
    stock: 0,
    sizesInput: "",
    colorsInput: "",
  });

  const inputHandle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (typeof Id === "string") {
      dispatch(getProduct(productId));
    }
  }, [productId]);

  const [cateShow, setCateShow] = useState(false);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [allCategory, setAllCategory] = useState<CategoryOption[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const selectedCategory = categorys.find(
    (c: CategoryOption) => c.name === category,
  );
  const availableSubcategories: string[] =
    selectedCategory?.subcategories || [];

  const categorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);

    if (value) {
      let srcValue = allCategory.filter(
        (c: CategoryOption) =>
          c.name.toLowerCase().indexOf(value.toLowerCase()) > -1,
      );
      setAllCategory(srcValue);
    } else {
      setAllCategory(categorys);
    }
  };

  const [imageShow, setImageShow] = useState<(string | File)[]>([]);

  const changeImage = (img: string | File, files: FileList) => {
    if (files.length > 0 && img instanceof File) {
      dispatch(
        productImageUpdate({
          oldImage: img,
          newImage: files[0],
          productId: Array.isArray(Id) ? Id[0] : Id || "",
        }),
      );
    }
  };

  useEffect(() => {
    setState({
      name: product?.name || "",
      description: product?.description || "",
      discount: product?.discount || 0,
      price: product?.price || 0,
      brand: product?.brand || "",
      stock: product?.stock || 0,
      sizesInput: (product?.sizes || []).join(", "),
      colorsInput: (product?.colors || []).join(", "),
    });
    setContent(product?.description || "");
    setCategory(product?.category || "");
    setSubcategory(product?.subcategory || "");
    if (product?.images) {
      setImageShow(product.images);
    }
  }, [product]);

  const update = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const obj = {
      name: state.name as string,
      description: content as string,
      category,
      subcategory,
      discount: state.discount as number,
      price: state.price as number,
      brand: state.brand as string,
      stock: state.stock as number,
      sizes: state.sizesInput
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
      colors: state.colorsInput
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean),
      productId: productId,
    };
    dispatch(updateProduct(obj));
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(productMessageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(productMessageClear());
      router.push("/seller/allproducts");
    }
  }, [errorMessage, successMessage]);

  return (
    <div>
      <form onSubmit={update}>
        <div className="flex flex-col mb-3 md:flex-row gap-4 w-full text-[#d0d2d6]">
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Product Name"
              name="name"
              value={state.name}
              onChange={inputHandle}
              id="name"
              type="text"
              placeholder={product?.name || ""}
            />
          </div>
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Brand"
              name="brand"
              value={state.brand}
              onChange={inputHandle}
              id="brand"
              type="text"
              placeholder={product?.brand || ""}
            />
          </div>
        </div>
        <div className="flex flex-col mb-3 md:flex-row gap-4 w-full text-[#d0d2d6]">
          <div className="flex flex-col w-full gap-1 relative">
            <FormInput
              label="Category"
              name="category"
              onClick={() => setCateShow(!cateShow)}
              value={category}
              onChange={inputHandle}
              id="category"
              type="text"
              placeholder={product?.category || ""}
              readOnly={true}
            />
            <div
              className={`absolute top-[101%] bg-slate-800 w-full transition-all ${
                cateShow ? "scale-100" : "scale-0"
              }`}
            >
              <div className="w-full px-4 py-2 fixed">
                <input
                  value={searchValue}
                  onChange={categorySearch}
                  className="px-3 py-1 w-full focus:border-indigo-500 outline-none bg-transparent border border-slate-700 rounded-md text-[#d0d2d6] overflow-hidden"
                  type="text"
                  placeholder="search"
                />
              </div>
              <div className="pt-14"></div>
              <div className="flex justify-start items-start flex-col h-50 overflow-x-scrool">
                {allCategory.length > 0 &&
                  allCategory.map((c, i) => (
                    <span
                      key={i}
                      className={`px-4 py-2 hover:bg-indigo-500 hover:text-white hover:shadow-lg w-full cursor-pointer ${
                        category === c.name && "bg-indigo-500"
                      }`}
                      onClick={() => {
                        setCateShow(false);
                        setCategory(c.name);
                        setSubcategory("");
                        setSearchValue("");
                        setAllCategory(categorys);
                      }}
                    >
                      {c.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Subcategory"
              name="subcategory"
              value={subcategory}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubcategory(e.target.value)
              }
              id="subcategory"
              type="text"
              placeholder={
                availableSubcategories.length
                  ? "Select or type subcategory"
                  : "Type subcategory"
              }
              list="update-subcategory-options"
            />
            {availableSubcategories.length > 0 ? (
              <datalist id="update-subcategory-options">
                {availableSubcategories.map((item: string) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            ) : null}
          </div>
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Stock"
              name="stock"
              value={state.stock}
              onChange={inputHandle}
              id="stock"
              type="number"
              placeholder={product?.stock || ""}
            />
          </div>
        </div>

        <div className="flex flex-col mb-3 md:flex-row gap-4 w-full text-[#d0d2d6]">
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Price"
              name="price"
              value={state.price}
              onChange={inputHandle}
              id="price"
              type="number"
              placeholder={product?.price || ""}
            />
          </div>
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Discount"
              name="discount"
              value={state.discount}
              onChange={inputHandle}
              id="discount"
              type="number"
              placeholder={product?.discount || ""}
            />
          </div>
        </div>
        <div className="flex flex-col mb-3 md:flex-row gap-4 w-full text-[#d0d2d6]">
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Sizes"
              name="sizesInput"
              value={state.sizesInput}
              onChange={inputHandle}
              id="sizesInput"
              type="text"
              placeholder="e.g. XS, S, M, L, XL"
            />
          </div>
          <div className="flex flex-col w-full gap-1">
            <FormInput
              label="Colors"
              name="colorsInput"
              value={state.colorsInput}
              onChange={inputHandle}
              id="colorsInput"
              type="text"
              placeholder="e.g. Black, White, Navy"
            />
          </div>
        </div>
        <div className="flex flex-col w-full gap-1 text-[#d0d2d6] mb-5">
          <label htmlFor="description">Description</label>
          <JoditEditor
            ref={editor}
            value={content}
            // config={config}
            tabIndex={1} // tabIndex of textarea
            onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
            onChange={(newContent) => {}}
            config={{
              readonly: false,
              theme: "dark", // this helps with basic dark mode
              height: 300,
              style: {
                backgroundColor: "#283046",
                color: "#d0d2d6",
                border: "1px solid #334155",
                borderRadius: "5px",
                padding: "8px",
              },
            }}
          />
        </div>
        <div className="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-3 sm:grid-cols-2 sm:gap-4 md:gap-4 xs:gap-4 gap-3 w-full text-[#d0d2d6] mb-4">
          {imageShow.map((img, i) => {
            const isFile = img instanceof File;

            return (
              <div key={i} className="h-45 relative">
                <Label htmlFor={String(i)}>
                  <Image
                    src={isFile ? URL.createObjectURL(img) : img}
                    alt="product"
                    sizes="100%"
                    fill
                    className="w-full h-full rounded-sm"
                  />
                </Label>
                <Input
                  onChange={(e) => {
                    if (e.target.files && isFile) {
                      changeImage(img, e.target.files);
                    }
                  }}
                  type="file"
                  id={String(i)}
                  className="hidden"
                />
              </div>
            );
          })}
        </div>
        <div className="flex">
          <Button
            disabled={loader ? true : false}
            className="bg-blue-500 w-47.5 hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3"
          >
            {loader ? <Loader2 className="animate-spin" /> : "Update product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
