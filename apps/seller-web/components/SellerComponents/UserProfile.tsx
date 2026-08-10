"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authMessageClear,
  get_user_info,
  profile_image_upload,
  profile_info_add,
} from "@/store/Auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsImages } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";

const UserProfile = () => {
  const [state, setState] = useState({
    division: "",
    district: "",
    shopName: "",
    sub_district: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null); // For image preview

  const dispatch = useAppDispatch();
  const { userInfo, loader, successMessage, token, errorMessage } =
    useAppSelector((state: RootState) => state.auth);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const formData = new FormData();
      formData.append("image", file);
      dispatch(profile_image_upload(formData));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(profile_info_add({ shopInfo: state }));
  };

  useEffect(() => {
    if (token) {
      dispatch(get_user_info());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(get_user_info());
      dispatch(authMessageClear());
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(authMessageClear());
    }
  }, [successMessage, dispatch, userInfo, errorMessage]);

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
        <div className="relative bg-slate-800 p-4 rounded-md text-sm flex flex-col gap-2">
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
        {!userInfo?.shopInfo ? (
          <form onSubmit={handleProfileInfoSubmit}>
            {["shopName", "division", "district", "sub_district"].map(
              (field, index) => (
                <div key={index} className="flex flex-col gap-1 mb-3">
                  <label htmlFor={field}>{field.replace("_", " ")}</label>
                  <Input
                    id={field}
                    name={field}
                    placeholder={field.replace("_", " ")}
                    value={state[field as keyof typeof state]}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ),
            )}
            <Button type="submit" disabled={loader} className="w-47.5">
              {loader ? <Loader2 className="animate-spin" /> : "Update Info"}
            </Button>
          </form>
        ) : (
          <div className="bg-slate-800 p-4 rounded-md text-sm flex flex-col gap-2 relative">
            <span className="absolute top-2 right-2 bg-yellow-500 text-black p-1.5 rounded cursor-pointer">
              <FaEdit />
            </span>
            <div>Shop Name: {userInfo.shopInfo?.shopName}</div>
            <div>Division: {userInfo.shopInfo?.division}</div>
            <div>District: {userInfo.shopInfo?.district}</div>
            <div>Sub District: {userInfo.shopInfo?.sub_district}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
