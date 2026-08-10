"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BiLogInCircle } from "react-icons/bi";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import { authMessageClear, logout } from "@/store/Auth/authSlice";
import { getNavs } from "./AllNav";

// Define the NavItem interface
interface NavItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ showSidebar, setShowSidebar }) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const { role, successMessage } = useAppSelector((state: any) => state.auth);
  const [allNav, setAllNav] = useState<NavItem[]>([]);

  useEffect(() => {
    const navs = getNavs(role);
    setAllNav(navs);
  }, [role]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage); // Show success message when it exists
      if (role === "admin") router.push("/admin/login");
      else router.push("/");
      dispatch(authMessageClear()); // Clear the message after showing it
    }
  }, [successMessage, role, router, dispatch]);

  const handleLogout = () => {
    dispatch(logout({ role }));
  };

  return (
    <div>
      <div
        onClick={() => setShowSidebar(false)}
        className={`fixed duration-200 ${
          !showSidebar ? "invisible" : "visible"
        } w-screen h-screen bg-[#22292f80] top-0 left-0 z-10`}
      ></div>
      <div
        className={`w-65 fixed bg-[#283046] z-50 top-0 h-screen shadow-[0_0_15px_0_rgb(34_41_47/5%)] transition-all ${
          showSidebar ? "left-0" : "-left-65 lg:left-0"
        }`}
      >
        <div className="h-17.5 flex justify-center items-center">
          <Link
            href="/"
            className="w-45 h-12.5"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Image
              src={"/images/logo.png"}
              alt="Logo"
              width={180}
              height={50}
            />
          </Link>
        </div>
        <div className="px-4">
          <ul>
            {allNav.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.path}
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`${
                    pathname === n.path
                      ? "bg-slate-600 shadow-indigo-500/30 text-white duration-500"
                      : "text-[#d0d2d6] font-normal duration-200"
                  } px-3 py-2.25 rounded-sm flex justify-start items-center gap-3 hover:pl-4 transition-all w-full mb-1`}
                >
                  <span>{n.icon}</span>
                  <span>{n.title}</span>
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout} // Using the handleLogout function to manage logout
                className="text-[#d0d2d6] font-normal duration-200 px-3 py-2.25 rounded-sm flex justify-start items-center gap-3 hover:pl-4 transition-all w-full mb-1"
              >
                <span>
                  <BiLogInCircle />
                </span>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
