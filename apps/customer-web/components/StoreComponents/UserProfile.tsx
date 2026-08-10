"use client";

import { profile_image_upload } from "@/store/Auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { BsImages } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { FaEdit } from "react-icons/fa";
import ShippingForm from "./ShippingForm";

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    phone: "",
    post: "",
    province: "",
    city: "",
    area: "",
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const formData = new FormData();
      formData.append("image", file);
      dispatch(profile_image_upload(formData));
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center py-3">
        <label
          htmlFor="img"
          className="relative h-52.5 w-full max-w-75 cursor-pointer overflow-hidden"
        >
          {userInfo?.profileImage || selectedImage ? (
            <Image
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : userInfo?.profileImage!
              }
              alt="Profile"
              width={300}
              height={210}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col justify-center items-center h-full border border-dashed border-[#d0d2d6] hover:border-indigo-500">
              <BsImages />
              <span>Select Image</span>
            </div>
          )}
        </label>
        <Input
          id="img"
          type="file"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Profile Info */}
      <div className="px-0 md:px-5 py-2">
        <div className="relative bg-slate-100 p-4 rounded-md text-sm flex flex-col gap-2">
          <span className="absolute top-2 right-2 bg-yellow-500 text-black p-1.5 rounded cursor-pointer">
            <FaEdit />
          </span>
          <div className="flex gap-2">
            <span>Name:</span>
            <span>{userInfo?.name}</span>
          </div>
          <div className="flex gap-2">
            <span>Email:</span>
            <span>{userInfo?.email}</span>
          </div>
          <div className="flex gap-2">
            <span>Role:</span>
            <span>{userInfo?.role}</span>
          </div>
          <div className="flex gap-2">
            <span>Status:</span>
            <span>{userInfo?.status}</span>
          </div>
          <div className="flex gap-2">
            <span>Payment Account:</span>
            {userInfo?.payment === "active" ? (
              <span className="ml-2 text-xs text-white bg-red-500 rounded px-2 py-0.5">
                {userInfo?.payment}
              </span>
            ) : (
              <span className="ml-2 text-xs text-white bg-blue-500 cursor-pointer rounded px-2 py-0.5">
                click active
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Shop Info */}
      <div className="px-0 md:px-5 py-2">
        <ShippingForm state={shippingInfo} setState={setShippingInfo} />
      </div>
    </div>
  );
};

export default UserProfile;
