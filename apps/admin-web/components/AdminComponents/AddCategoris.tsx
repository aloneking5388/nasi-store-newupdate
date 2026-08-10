"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { GrClose } from "react-icons/gr";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { BsImage } from "react-icons/bs";
import { Loader2 } from "lucide-react";
import {
  categoryAdd,
  CategoryMessageClear,
} from "@/store/Categoris/categorySlice";
import Categories from "./Categorys";

const AddCategoris = () => {
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [imageShow, setImage] = useState("");
  const { successMessage, errorMessage, loader } = useAppSelector(
    (state) => state.category,
  );

  const [state, setState] = useState<{
    name: string;
    subcategories: string;
    image: File | null;
  }>({
    name: "",
    subcategories: "",
    image: null,
  });

  const imageHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImage(URL.createObjectURL(file)); // Update image preview URL
      setState({ ...state, image: file }); // Update image state
    }
  };

  const add_category = (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.image) {
      toast.error("Please select an image");
      return;
    }

    dispatch(
      categoryAdd(
        state as { name: string; subcategories: string; image: File },
      ),
    )
      .then(() => {
        setState({ name: "", subcategories: "", image: null });
        setImage(""); // Reset image preview
      })
      .catch(() => {
        setState({ name: "", subcategories: "", image: null });
        setImage(""); // Reset image preview on error
      });
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(CategoryMessageClear());
      setState({ name: "", subcategories: "", image: null });
      setImage("");
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(CategoryMessageClear());
      setState({ name: "", subcategories: "", image: null });
      setImage("");
    }
  }, [successMessage, errorMessage]);

  return (
    <>
      <div className="flex lg:hidden justify-between items-center mb-5 p-4 bg-[#283046]rounded-md">
        <h1 className="text-[#d0d2d6] font-semibold text-lg">Categorys</h1>
        <Button
          onClick={() => setShow(true)}
          className="bg-indigo-500 shadow-lg hover:shadow-indigo-500/50 px-4 py-2 cursor-pointer text-white rounded-sm text-sm"
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap w-full">
        <div className="w-full lg:w-7/12">
          <Categories />
        </div>
        <div
          className={`w-[320px] lg:w-5/12  lg:relative lg:right-0 fixed ${
            show ? "right-0" : "right-85"
          } z-9999 top-0 transition-all duration-500`}
        >
          <div className="w-full pl-5">
            <div className="bg-[#283046]h-screen lg:h-auto px-3 py-2 lg:rounded-md text-[#d0d2d6]">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-[#d0d2d6] font-semibold text-xl">
                  Add Category
                </h1>
                <div
                  onClick={() => setShow(false)}
                  className="block lg:hidden cursor-pointer"
                >
                  <GrClose className="text-[#d0d2d6]" />
                </div>
              </div>
              <form onSubmit={add_category}>
                <div className="flex flex-col w-full gap-1 mb-3">
                  <Label htmlFor="name">Category name</Label>
                  <Input
                    value={state.name}
                    onChange={(e) =>
                      setState({ ...state, name: e.target.value })
                    }
                    className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046]border border-slate-700 rounded-md text-[#d0d2d6]"
                    type="text"
                    id="name"
                    name="category_name"
                    placeholder="category name"
                    required
                  />
                </div>
                <div className="flex flex-col w-full gap-1 mb-3">
                  <Label htmlFor="subcategories">Subcategories</Label>
                  <Input
                    value={state.subcategories}
                    onChange={(e) =>
                      setState({ ...state, subcategories: e.target.value })
                    }
                    className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046]border border-slate-700 rounded-md text-[#d0d2d6]"
                    type="text"
                    id="subcategories"
                    name="subcategories"
                    placeholder="e.g. T-Shirts, Hoodies, Jackets"
                  />
                </div>
                <div>
                  <Label
                    className="flex justify-center items-center flex-col h-59.5 cursor-pointer border border-dashed hover:border-indigo-500 w-full border-[#d0d2d6]"
                    htmlFor="image"
                  >
                    {imageShow ? (
                      <Image
                        width={100}
                        height={100}
                        src={imageShow}
                        alt="category"
                      />
                    ) : (
                      <>
                        <span>
                          <BsImage />
                        </span>
                        <span>select Image</span>
                      </>
                    )}
                  </Label>
                </div>
                <Input
                  onChange={imageHandle}
                  className="hidden"
                  type="file"
                  name="image"
                  id="image"
                  required
                />
                <div className="mt-4">
                  <Button
                    disabled={loader ? true : false}
                    className="bg-blue-500 w-full hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3"
                  >
                    {loader ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Add Category"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCategoris;
