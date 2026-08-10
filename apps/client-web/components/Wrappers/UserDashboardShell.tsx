"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { get_user_info } from "@/store/Auth/authSlice";

export default function UserDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { token, userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !userInfo) {
      dispatch(get_user_info());
      
    }
  }, [dispatch, token, userInfo]);

  return (
    <div className="">
      {children}
    </div>
  )
}
