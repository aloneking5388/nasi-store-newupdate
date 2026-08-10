"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminMessageClear,
  get_seller,
  seller_status_update,
} from "@/store/Admin/adminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

const EditSeller = () => {
  const dispatch = useAppDispatch();
  const { seller, successMessage, loader } = useAppSelector(
    (state) => state.admin
  );
  const params = useParams();
  const sellerId = params?.sellerId as string;

  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (sellerId) dispatch(get_seller(sellerId));
  }, [sellerId]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(adminMessageClear());
    }
  }, [successMessage]);

  useEffect(() => {
    if (seller) {
      setStatus(seller.status);
    }
  }, [seller]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(
      seller_status_update({ sellerId, status })
    );
    if (seller_status_update.fulfilled.match(resultAction)) {
      dispatch(get_seller(sellerId));
    }
  };
  return (
    <div>
      <Card className="bg-[#283046] text-[#d0d2d6]">
        <CardContent className="p-4">
          <div className="flex flex-wrap">
            {/* Seller Image */}
            <div className="w-full md:w-3/12 flex justify-center items-center py-3">
              {seller?.profileImage ? (
                <Image
                  src={seller.profileImage}
                  alt="Seller"
                  className="object-cover rounded-md"
                  width={230}
                  height={230}
                />
              ) : (
                <span>Image not uploaded</span>
              )}
            </div>

            {/* Basic Info */}
            <div className="w-full md:w-4/12 px-4">
              <h2 className="text-lg font-medium mb-2">Basic Info</h2>
              <div className="bg-slate-800 p-4 rounded-md text-sm space-y-2">
                <div>
                  <strong>Name:</strong> {seller?.name}
                </div>
                <div>
                  <strong>Email:</strong> {seller?.email}
                </div>
                <div>
                  <strong>Role:</strong> {seller?.role}
                </div>
                <div>
                  <strong>Status:</strong> {seller?.status}
                </div>
                <div>
                  <strong>Payment:</strong> {seller?.payment}
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div className="w-full md:w-4/12 px-4">
              <h2 className="text-lg font-medium mb-2">Address</h2>
              <div className="bg-slate-800 p-4 rounded-md text-sm space-y-2">
                <div>
                  <strong>Shop Name:</strong> {seller?.shopInfo?.shopName}
                </div>
                <div>
                  <strong>Division:</strong> {seller?.shopInfo?.division}
                </div>
                <div>
                  <strong>District:</strong> {seller?.shopInfo?.district}
                </div>
                <div>
                  <strong>Sub-District:</strong>{" "}
                  {seller?.shopInfo?.sub_district}
                </div>
              </div>
            </div>
          </div>

          {/* Status Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row gap-4"
          >
            <div className="w-full sm:w-[200px] flex flex-row gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[#283046] text-[#d0d2d6] border-slate-700">
                  <SelectValue placeholder="--select status--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-blue-500 w-[170px]">
              {loader ? (
                <Loader2 className="animate-spin text-white w-5 -h-5" />
              ) : (
                "Update Status"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSeller;
