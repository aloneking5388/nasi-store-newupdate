"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "../ui/button";
import { authMessageClear, logout } from "@/store/Auth/authSlice";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const PendingAccount = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { userInfo, successMessage, errorMessage } = useAppSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout({ role: userInfo?.role || "user" }));
  };

  useEffect(() => {
    if (successMessage || errorMessage) {
      if (successMessage) {
        localStorage.removeItem("accessToken");
        toast.success(successMessage);
        router.push("/");
      } else {
        toast.error(errorMessage);
      }
      dispatch(authMessageClear());
    }
  }, [successMessage, errorMessage, router, dispatch]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-semibold text-red-600">
        Your Account is Not Activated
      </h2>

      <p className="mt-3 text-gray-700">
        Your account is currently pending approval. Please contact the Support team to activate your account.
      </p>

      <p className="mt-4 text-sm text-gray-500">
        Email: support@nasistore.com
      </p>

      <div className="mt-6">
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
};

export default PendingAccount;
