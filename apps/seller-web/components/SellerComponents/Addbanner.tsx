"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { add_banner, bannerMessageClear, clearBanner, get_banner, update_banner } from "@/store/products/bannerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";

const Addbanner = () => {
     const dispatch = useAppDispatch();
      const { id } = useParams();
      const [image, setImage] = useState("");
      const [imageShow, setImageShow] = useState("");
      const productId = id;
    
      const { loader, errorMessage, successMessage, banner } = useAppSelector(
        (state) => state.banner
      );
    
      const imageHandle = (e: any) => {
        const files = e.target.files;
        const length = files.length;
    
        if (length > 0) {
          setImage(files[0]);
          setImageShow(URL.createObjectURL(files[0]));
        }
      };
    
      const add = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("productId", productId as string);
        formData.append("image", image);
    
        dispatch(add_banner(formData));
      };
    
      const update = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("image", image);
    
        dispatch(
          update_banner({
            bannerId: banner?._id || "",
            formData,
          })
        );
      };
    
      useEffect(() => {
        if (errorMessage) {
          toast.error(errorMessage);
          dispatch(bannerMessageClear());
        }
        if (successMessage) {
          toast.success(successMessage);
          dispatch(bannerMessageClear());
          setImageShow("");
          setImage("");
        }
      }, [successMessage, errorMessage]);
    
      useEffect(() => {
        dispatch(clearBanner());
        dispatch(get_banner(productId as string));
      }, [productId]);
  return (
    <div>
      {!banner && (
        <div>
          <form onSubmit={add}>
            <div className="mb-6">
              <Label
                className="flex justify-center items-center flex-col h-[180px] cursor-pointer border border-dashed hover:border-indigo-500 w-full text-[#d0d2d6]"
                htmlFor="image"
              >
                <span className="text-4xl">
                  <FaCloudUploadAlt />
                </span>
                <span>select banner image</span>
              </Label>
              <Input
                required
                onChange={imageHandle}
                className="hidden"
                type="file"
                id="image"
              />
            </div>
            {imageShow && (
              <div className="mb-4 w-full h-[300px] relative">
                <Image
                  src={imageShow}
                  alt="image"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <Button
              disabled={loader ? true : false}
              className="bg-blue-500 w-[190px] hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3"
            >
              {loader ? <Loader2 className="animate-spin" /> : "Add banner"}
            </Button>
          </form>
        </div>
      )}
      {banner && (
        <div>
          {
            <div className="mb-4 w-full h-[300px] relative">
              <Image
                src={banner.banner}
                alt="image"
                fill
                className="object-contain"
              />
            </div>
          }
          <form onSubmit={update}>
            <div className="mb-6">
              <Label
                className="flex justify-center items-center flex-col h-[180px] cursor-pointer border border-dashed hover:border-indigo-500 w-full text-[#d0d2d6]"
                htmlFor="image"
              >
                <span className="text-4xl">
                  <FaCloudUploadAlt />
                </span>
                <span>select banner image</span>
              </Label>
              <Input
                required
                onChange={imageHandle}
                className="hidden"
                type="file"
                id="image"
              />
            </div>
            {imageShow && (
              <div className="mb-4 w-full h-[300px] relative">
                <Image
                  src={imageShow}
                  alt="image"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <Button
              disabled={loader ? true : false}
              className="bg-blue-500 w-[190px] hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3"
            >
              {loader ? <Loader2 className="animate-spin" /> : "update banner"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Addbanner;
