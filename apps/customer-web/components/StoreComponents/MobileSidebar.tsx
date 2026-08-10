"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiFillGithub, AiOutlineTwitter } from "react-icons/ai";
import { FaFacebookF, FaLinkedinIn, FaLock, FaUser } from "react-icons/fa";
import { useAppSelector } from "@/store/hooks";
import { GrMail } from "react-icons/gr";
import { IoIosCall } from "react-icons/io";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useMemo } from "react";

type MobileSidebarProps = {
  showShidebar: boolean;
  setShowShidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

const MobileSidebar = ({
  showShidebar,
  setShowShidebar,
}: MobileSidebarProps) => {
  const pathname = usePathname();
  const { userInfo } = useAppSelector((state) => state.auth);

  const link = useMemo(() => {
    if (!userInfo) return "/login";
    if (userInfo.role === "admin") return "/admin";
    if (userInfo.role === "seller") return "/seller";
    return "/dashboard";
  }, [userInfo]);

  return (
    <div className="">
      {showShidebar && (
        <div className="hidden max-md:block">
          <div
            onClick={() => setShowShidebar(!showShidebar)}
            className={`fixed inset-0 bg-[rgba(0,0,0,0.5)] transition-opacity duration-300 ${
              showShidebar ? "opacity-100 visible" : "opacity-0 invisible"
            } z-20 md:hidden`}
          ></div>
          <div
            className={`fixed top-0 left-0 w-75 h-screen bg-white pt-2 px-8 transition-transform duration-300 ${
              showShidebar ? "translate-x-0" : "-translate-x-full"
            } z-30 md:hidden`}
          >
            <div className="flex justify-start flex-col gap-4">
              <Link href="/" onClick={() => setShowShidebar(!showShidebar)}>
                <div className="relative w-45 h-12.5">
                  <Image
                    src="/images/logo.png"
                    alt="logo"
                    fill
                    sizes="180px"
                    className="object-contain"
                  />
                </div>
              </Link>
              <div className="flex justify-star items-center gap-10">
                <div className="flex group cursor-pointer text-slate-800 text-sm justify-center items-center gap-1 relative after:h-4.5 after:w-px after:bg-[#afafaf] after:-right-4 after:absolute">
                  <Image
                    src="/images/language.png"
                    alt="language"
                    width={24}
                    height={16}
                  />
                  <span>
                    <MdOutlineKeyboardArrowDown />
                  </span>
                  <ul className="absolute invisible transition-all to-12 rounded-sm duration-200 text-white p-2 w-25 flex flex-col gap-3 group-hover:visible group-hover:top-6 group-hover:bg-black z-10">
                    <li>Hindi</li>
                    <li>English</li>
                  </ul>
                </div>
                <Link
                  className="flex cursor-pointer justify-center items-center gap-2 text-sm"
                  onClick={() => setShowShidebar(!showShidebar)}
                  href={link}
                >
                  {userInfo ? (
                    <div className="flex justify-center items-center gap-2">
                      <span>
                        {userInfo.profileImage ? (
                          <Image
                            src={userInfo.profileImage}
                            alt={userInfo.name}
                            width={20}
                            height={20}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </span>
                      <span>{userInfo.name}</span>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center gap-2">
                      <span>
                        <FaLock />
                      </span>
                      <span>Login</span>
                    </div>
                  )}
                </Link>
              </div>
              <ul className="flex flex-col justify-start items-start  text-md font-semibold uppercase">
                <li>
                  <Link
                    href="/"
                    onClick={() => setShowShidebar(!showShidebar)}
                    className={`py-2 block ${
                      pathname === "/" ? "text-purple-500" : "text-slate-600"
                    }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    onClick={() => setShowShidebar(!showShidebar)}
                    className={`py-2 block ${
                      pathname === "/shop"
                        ? "text-purple-500"
                        : "text-slate-600"
                    }`}
                  >
                    Shops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    onClick={() => setShowShidebar(!showShidebar)}
                    className={`py-2 block ${
                      pathname === "/blog"
                        ? "text-purple-500"
                        : "text-slate-600"
                    }`}
                  >
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={() => setShowShidebar(!showShidebar)}
                    className={`py-2 block ${
                      pathname === "/about"
                        ? "text-purple-500"
                        : "text-slate-600"
                    }`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setShowShidebar(!showShidebar)}
                    className={`py-2 block ${
                      pathname === "/contact"
                        ? "text-purple-500"
                        : "text-slate-600"
                    }`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
              <div className="flex justify-start  items-center gap-4">
                <a href="#" className="text-blue-700">
                  <FaFacebookF />
                </a>
                <a href="#" className="text-blue-400">
                  <AiOutlineTwitter />
                </a>
                <a href="#" className="text-blue-900">
                  <FaLinkedinIn />
                </a>
                <a href="#" className="text-black">
                  <AiFillGithub />
                </a>
              </div>
              <div className="w-full flex justify-end max-md:justify-start gap-4 items-center">
                <div className="w-7.5 h-7.5 rounded-full flex bg-[#f5f5f5] justify-center items-center">
                  <span>
                    <IoIosCall />
                  </span>
                </div>
                <div className="flex justify-end flex-col gap-1">
                  <h2 className="text-xs font-semibold text-slate-700">
                    +91 (635) 600 1885
                  </h2>
                  <span className="text-xs">support 24/7 time</span>
                </div>
              </div>
              <ul className="flex flex-col justify-start items-start gap-3 text-[#1c1c1c]">
                <li className="flex justify-start items-center gap-2  text-xs">
                  <span>
                    <GrMail />
                  </span>
                  <span>support@nasistore.com</span>
                </li>
                <span className="text-xs">Nasi Store</span>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSidebar;
