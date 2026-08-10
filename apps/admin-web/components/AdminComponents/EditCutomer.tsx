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
  get_customer,
  update_customer_status,
  update_customer_type,
} from "@/store/Admin/adminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EditCustomer = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loader, successMessage, errorMessage, customer } = useAppSelector(
    (state) => state.admin,
  );
  const params = useParams();
  const customerId = params?.Id as string;
  console.log("Customer ID from params:", customerId);

  const [status, setStatus] = useState<"pending" | "active" | "suspended">(
    "pending",
  );
  const [customerType, setCustomerType] = useState<"normal" | "subscription">(
    "subscription",
  );

  useEffect(() => {
    if (customerId) {
      console.log("Fetching customer with ID:", customerId);
      dispatch(get_customer(customerId));
    }
  }, [customerId, dispatch]);

  // Sync status only when customer is fetched
  useEffect(() => {
    if (customer?.status) {
      setStatus(customer.status);
    }
    if (customer?.customerType) {
      setCustomerType(customer.customerType);
    }
  }, [customer?.status, customer?.customerType]);

  // Handle success/error toast and refresh
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(adminMessageClear());
      dispatch(get_customer(customerId));
      router.push("/admin/customers");
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(adminMessageClear());
    }
  }, [successMessage, errorMessage, dispatch, customerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(update_customer_status({ userId: customerId, newStatus: status }));
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(update_customer_type({ userId: customerId, customerType }));
  };

  return (
    <div>
      <Card className="bg-[#283046] text-[#d0d2d6]">
        <CardContent className="p-4">
          <div className="flex flex-wrap">
            <div className="w-full md:w-3/12 flex justify-center items-center py-3">
              {customer?.profileImage ? (
                <img
                  src={customer?.profileImage}
                  alt="Customer"
                  className="h-57.5 rounded-md"
                />
              ) : (
                <span>Image not uploaded</span>
              )}
            </div>
            <div className="w-full md:w-4/12 px-4">
              <h2 className="text-lg font-medium mb-2">Basic Info</h2>
              <div className="bg-slate-800 p-4 rounded-md text-sm space-y-2">
                <div>
                  <strong>Name:</strong> {customer?.name}
                </div>
                <div>
                  <strong>Email:</strong> {customer?.email}
                </div>
                <div>
                  <strong>Level:</strong> {customer?.level}
                </div>
                <div>
                  <strong>Status:</strong> {customer?.status}
                </div>
                <div>
                  <strong>Customer Type:</strong> {customer?.customerType}
                </div>
                <div>
                  <strong>Payment:</strong> {customer?.invested}
                </div>
              </div>
            </div>
          </div>

          {/* Status Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row gap-4"
          >
            <div className="w-full sm:w-50">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as any)}
              >
                <SelectTrigger className="bg-[#283046] text-[#d0d2d6] border-slate-700">
                  <SelectValue placeholder="--select status--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-100 bg-blue-500 hover:bg-blue-600"
              disabled={loader}
            >
              {loader ? (
                <Loader2 className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                "Update"
              )}
            </Button>
          </form>

          <form
            onSubmit={handleTypeSubmit}
            className="mt-4 flex flex-col sm:flex-row gap-4"
          >
            <div className="w-full sm:w-50">
              <Label>Customer Type</Label>
              <Select
                value={customerType}
                onValueChange={(val) =>
                  setCustomerType(val as "normal" | "subscription")
                }
              >
                <SelectTrigger className="bg-[#283046] text-[#d0d2d6] border-slate-700">
                  <SelectValue placeholder="--select type--" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-100 bg-emerald-500 hover:bg-emerald-600"
              disabled={loader}
            >
              {loader ? (
                <Loader2 className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                "Update Customer Type"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCustomer;
