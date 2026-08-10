"use client";

import React from "react";
import { FaList } from "react-icons/fa";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { Input } from "../ui/input";

interface HeaderProps {
  showSidebar: boolean;
  setShowSidebar: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ showSidebar, setShowSidebar }) => {
  const userInfo = useAppSelector((state: any) => state.auth.userInfo);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full py-5 px-2 lg:px-7 z-40">
      <div className="ml-0 lg:ml-65 rounded-md h-16.25 flex justify-between items-center bg-[#283046] text-[#d0d2d6] px-5 transition-all">
        <div
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-8.75 flex lg:hidden h-8.75 rounded-sm bg-indigo-500 shadow-lg hover:shadow-indigo-500/50 justify-center items-center cursor-pointer"
        >
          <FaList />
        </div>

        <div className="hidden md:block">
          <Input
            className="px-3 py-2 outline-none border bg-transparent border-slate-500 rounded-md text-[#d0d2d6] focus:border-indigo-500 overflow-hidden"
            type="text"
            name="search"
            placeholder="search"
          />
        </div>

        <div className="flex justify-center items-center gap-8 relative">
          <div className="flex justify-center items-center gap-3">
            <div className="flex justify-center items-center flex-col text-end">
              <h2 className="text-sm font-bold">
                {mounted ? userInfo?.name : ""}
              </h2>
              <span className="text-[14px] w-full font-normal">
                {mounted ? userInfo?.role : ""}
              </span>
            </div>
            <Image
              className="rounded-full overflow-hidden"
              src={
                mounted && userInfo?.profileImage
                  ? userInfo?.profileImage
                  : mounted && userInfo?.role === "admin"
                    ? "/images/admin.jpg"
                    : "/images/seller.png"
              }
              alt="user"
              width={50}
              height={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
