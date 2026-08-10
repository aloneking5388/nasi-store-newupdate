"use client";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AiFillGithub, AiOutlineTwitter } from "react-icons/ai";
import { FaFacebookF, FaLinkedinIn, FaLock, FaUser } from "react-icons/fa";
import { GrMail } from "react-icons/gr";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const OfferSlider = dynamic(() => import("./OfferSlider"), {
  ssr: false,
  loading: () => <div className="h-full max-w-175" />,
});

const TopHeader = () => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const safeUserInfo = mounted ? userInfo : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const link = useMemo(() => {
    if (!safeUserInfo || !safeUserInfo.id) return "/login";
    if (safeUserInfo.role === "admin") return "/admin";
    if (safeUserInfo.role === "seller") return "/seller";
    return "/dashboard";
  }, [safeUserInfo]);

  return (
    <div className="bg-purple-100 h-10 max-md:hidden">
      <div className="max-w-360 mx-auto px-16 sm:px-5 max-md:px-12 md:px-10">
        <div className="flex w-full justify-between items-center h-10 text-slate-600">
          <ul className="flex justify-start items-center gap-8">
            <li className="flex relative justify-center items-center gap-2 text-sm after:absolute after:h-4.5 after:w-px after:bg-[#afafaf] after:-right-4">
              <span>
                <GrMail />
              </span>
              <span>support@nasistore.com</span>
            </li>
            <li className="w-full">
              <OfferSlider />
            </li>
          </ul>
          <div>
            <div className="flex justify-center items-center gap-10">
              <div className="flex justify-center items-center gap-4">
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
              <div className="flex group cursor-pointer text-slate-800 text-sm justify-center items-center gap-1 relative after:h-4.5 after:w-px after:bg-[#afafaf] after:-right-4 after:absolute before:absolute before:h-4.5 before:bg-[#afafaf] before:w-px before:-left-5">
                <Image
                  src="/images/language.png"
                  alt="language"
                  width={24}
                  height={16}
                />
                <span>
                  <MdOutlineKeyboardArrowDown />
                </span>
                <ul className="absolute invisible transition-all to-12 rounded-sm duration-200 text-slate-500 p-2 w-25 flex flex-col gap-3 group-hover:visible group-hover:top-6 group-hover:bg-purple-200 z-10">
                  <li>Hindi</li>
                  <li>English</li>
                </ul>
              </div>
              <Link
                className="flex cursor-pointer justify-center items-center gap-2 text-sm"
                href={link}
              >
                {safeUserInfo ? (
                  <div className="flex justify-center items-center gap-2">
                    <span>
                      {safeUserInfo.profileImage ? (
                        <Image
                          src={safeUserInfo.profileImage}
                          alt={safeUserInfo.name}
                          width={30}
                          height={30}
                        />
                      ) : (
                        <FaUser />
                      )}
                    </span>
                    <span>{safeUserInfo.name}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
