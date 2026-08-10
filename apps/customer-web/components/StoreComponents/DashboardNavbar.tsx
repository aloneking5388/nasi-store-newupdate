"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { FaList } from "react-icons/fa";
import Link from "next/link";
import { BiLogInCircle } from "react-icons/bi";
import { ImProfile } from "react-icons/im";
import { BsChat, BsHeart } from "react-icons/bs";
import { RiProductHuntLine } from "react-icons/ri";
import { RxDashboard } from "react-icons/rx";
import { IoWalletOutline } from "react-icons/io5";
import { authMessageClear, logout } from "@/store/Auth/authSlice";
import { useRouter } from "next/navigation";

const DashboardNavbar = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [filterShow, setFilterShow] = useState(false);
  const { userInfo, successMessage, errorMessage } = useAppSelector(
    (state) => state.auth,
  );

  const handleLogout = () => {
    dispatch(
      logout({
        role: userInfo?.role || "user",
      }),
    );
  };

  useEffect(() => {
    if (successMessage && !userInfo) {
      localStorage.removeItem("accessToken");
      toast.success(successMessage);
      router.push("/");
      dispatch(authMessageClear());
    } else if (successMessage) {
      toast.success(successMessage);
      dispatch(authMessageClear());
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(authMessageClear());
    }
  }, [successMessage, errorMessage, dispatch, router, userInfo]);
  return (
    <div className="bg-slate-200 mt-5">
      <div className="w-full mx-auto pt-5 max-md:block hidden">
        <div className="mx-4">
          <Button
            onClick={() => setFilterShow(!filterShow)}
            className="text-center py-3 px-3 bg-indigo-500 text-white"
          >
            <FaList />
          </Button>
        </div>
      </div>
      <div className="h-full mx-auto">
        <div className="py-5 flex w-full mx-auto relative">
          <div
            className={`rounded-md z-50 max-md:absolute ${
              filterShow ? "-left-4" : "-left-90"
            } w-67.5 ml-4 bg-white`}
          >
            <ul className="py-2 text-slate-600 px-4">
              <li className="flex justify-start items-center gap-2 py-2">
                <span className="text-xl">
                  <RxDashboard />
                </span>
                <Link
                  href="/dashboard"
                  onClick={() => setFilterShow(!filterShow)}
                  className="block"
                >
                  Dashboard
                </Link>
              </li>
              <li className="flex justify-start items-center gap-2 py-2">
                <span className="text-xl">
                  <IoWalletOutline />
                </span>
                {userInfo?.customerType === "subscription" ? (
                  <Link
                    href="/dashboard/wallet"
                    onClick={() => setFilterShow(!filterShow)}
                    className="block"
                  >
                    Wallet
                  </Link>
                ) : (
                  <span className="block text-slate-400">Wallet</span>
                )}
              </li>
              <li className="flex justify-start items-center gap-2 py-2">
                <span className="text-xl">
                  <RiProductHuntLine />
                </span>
                <Link
                  href="/dashboard/orders"
                  onClick={() => setFilterShow(!filterShow)}
                  className="block"
                >
                  My Orders
                </Link>
              </li>
              <li className="flex justify-start items-center gap-2 py-2">
                <span className="text-xl">
                  <BsHeart />
                </span>
                <Link
                  href="/dashboard/wishlist"
                  onClick={() => setFilterShow(!filterShow)}
                  className="block"
                >
                  Wishlist
                </Link>
              </li>
              <li className="flex justify-start items-center gap-2 py-2">
                <span className="text-xl">
                  <BsChat />
                </span>
                <Link
                  href="/dashboard/chat"
                  onClick={() => setFilterShow(!filterShow)}
                  className="block"
                >
                  Chat
                </Link>
              </li>

              <li className="flex justify-start items-center gap-2 py-2">
                <span className="text-xl">
                  <ImProfile />
                </span>
                <Link
                  href="/dashboard/profileSetting"
                  onClick={() => setFilterShow(!filterShow)}
                  className="block"
                >
                  Profile Setting
                </Link>
              </li>
              {userInfo?.customerType !== "subscription" && (
                <li className="flex justify-start items-center gap-2 py-2">
                  <span className="text-xl">
                    <IoWalletOutline />
                  </span>
                  <Link
                    href="/dashboard"
                    onClick={() => setFilterShow(!filterShow)}
                    className="block"
                  >
                    Join Subscription
                  </Link>
                </li>
              )}
              <li
                onClick={handleLogout}
                className="flex justify-start items-center gap-2 py-2 cursor-pointer"
              >
                <span className="text-xl">
                  <BiLogInCircle />
                </span>
                <div className="block">Logout</div>
              </li>
            </ul>
          </div>
          <div className="w-[calc(100%-270px)] max-md:w-full">
            <div className="mx-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
