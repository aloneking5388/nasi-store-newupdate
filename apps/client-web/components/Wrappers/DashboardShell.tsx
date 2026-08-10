"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Header from "../DashboardComponents/Header";
import Sidebar from "../DashboardComponents/Sidebar";
import { get_user_info } from "@/store/Auth/authSlice";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const dispatch = useAppDispatch();
  const { token, userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !userInfo) {
      dispatch(get_user_info());
    }
  }, [dispatch, token, userInfo]);

  return (
    <>
      <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className="ml-0 lg:ml-65 pt-23.75 transition-all">{children}</div>
    </>
  );
}
