"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaLinkedin, FaRegAddressCard } from "react-icons/fa";
import { GiRotaryPhone } from "react-icons/gi";
import { TfiEmail } from "react-icons/tfi";
import { Input } from "@/components/ui/input";
import {
  AiFillGithub,
  AiFillHeart,
  AiFillShopping,
  AiOutlineTwitter,
} from "react-icons/ai";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  resetNewsletterState,
  subscribeUser,
} from "@/store/Emails/newsLetterSlice";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const Footer = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { successMessage, errorMessage, loader } = useAppSelector(
    (state) => state.newsLetter,
  );
  const { cartCount, wishlistCount } = useAppSelector((state) => state.cart);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = form.get("email")?.toString().trim();
    const name = "Guest";

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    dispatch(subscribeUser({ email, name }));
    (e.currentTarget as HTMLFormElement).reset();
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(resetNewsletterState());
    } else if (errorMessage) {
      toast.error(errorMessage);
      dispatch(resetNewsletterState());
    }
  }, [successMessage, errorMessage, dispatch]);

  return (
    <footer className="bg-purple-100">
      <div className="lg:grid flex flex-wrap sm:grid-cols-1 gap-6 lg:grid-cols-3 max-w-360 px-4 sm:px-8 md:px-10 lg:px-16 mx-auto border-b py-14 md:pb-10 sm:pb-6">
        <div className="md:w-6/12 lg:w-8/12 w-full">
          <div className="flex flex-col gap-2 max-md:justify-start max-md:items-start lg:justify-center lg:items-center">
            <div className="relative w-47.5 h-17.5 max-md:w-37.5 max-md:h-13.75">
              <Image
                src="/images/logo.png"
                alt="logo"
                fill
                sizes="(max-width: 768px) 150px, 190px"
                className="object-contain"
              />
            </div>
            <ul className="flex flex-col gap-2 text-md font-semibold text-slate-700">
              <li className="flex flex-row gap-2 justify-start items-center">
                <FaRegAddressCard />
                Navsari, Gujarat, India
              </li>
              <li className="flex flex-row gap-2 justify-start items-center">
                <GiRotaryPhone /> +91 (635) 600 1885
              </li>
              <li className="flex flex-row gap-2 justify-start items-center">
                <TfiEmail /> support@nasistore.com
              </li>
            </ul>
          </div>
        </div>
        <div className="md:w-6/12 lg:w-8/12 w-full">
          <div className="flex justify-center sm:justify-start sm:mt-6 w-full">
            <div>
              <h2 className="font-bold max-md:font-semibold max-md:text-md text-lg  mb-2">
                Usefull links
              </h2>
              <div className="flex justify-between gap-8 lg:gap-10">
                <ul className="flex flex-col gap-2 max-sm:w-20 max-md:gap-1 max-md:text-xs text-slate-700 text-sm">
                  <li>
                    <Link href="/about">About Us</Link>
                  </li>
                  <li>
                    <Link href="/about-shops">About Shops</Link>
                  </li>
                  <li>
                    <Link href="/about-delivery">About Delivery</Link>
                  </li>
                  <li>
                    <Link href="/about-group">About Group</Link>
                  </li>
                </ul>
                <ul className="flex flex-col gap-2 max-sm:w-20 text-slate-700 max-md:gap-1 max-md:text-xs text-sm">
                  <li>
                    <Link href="/seller/login">Become a Seller</Link>
                  </li>
                  <li>
                    <Link href="/returnpolicy">Return Policy</Link>
                  </li>
                  <li>
                    <Link href="/deliverypolicy">Delivery Policy</Link>
                  </li>
                  <li>
                    <Link href="/privacypolicy">Privacy Policy</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:mt-6">
          <div className="w-full flex flex-col justify-start gap-5 max-md:gap-2">
            <h2 className="font-bold max-md:font-semibold text-lg max-md:text-md max-md:mb-0 mb-2">
              Join Our
            </h2>
            <span className="text-slate-700 max-md:text-sm">
              Get Email updates about our latest and shop specials offers
            </span>
            <form
              onSubmit={handleSubscribe}
              className="h-10 rounded-lg w-full bg-slate-100 border relative"
            >
              <Input
                name="email"
                placeholder="Enter your mail"
                className="h-full bg-transparent w-full px-3 outline-0 lg:text-sm text-xs"
                type="email"
              />
              <Button
                type="submit"
                disabled={loader}
                className="h-full hover:bg-purple-700 top-0 rounded-e-lg absolute right-0 bg-purple-500 text-white uppercase px-4 lg:font-bold font-semibold text-[10px] lg:text-sm"
              >
                {loader ? <Loader2 /> : "Subscribe"}
              </Button>
            </form>

            <ul className="flex justify-start items-center gap-3">
              <li>
                <a
                  className="w-9.5 h-9.5 max-md:w-7 text-blue-700 max-md:h-7 hover:bg-blue-700 hover:text-white flex justify-center items-center bg-white rounded-full"
                  href="#"
                >
                  <FaFacebookF />
                </a>
              </li>
              <li>
                <a
                  className="w-9.5 h-9.5 max-md:w-7 text-blue-400 max-md:h-7 hover:bg-blue-400 hover:text-white flex justify-center items-center bg-white rounded-full"
                  href="#"
                >
                  <AiOutlineTwitter />
                </a>
              </li>
              <li>
                <a
                  className="w-9.5 h-9.5 max-md:w-7 text-blue-900 max-md:h-7 hover:bg-blue-900 hover:text-white flex justify-center items-center bg-white rounded-full"
                  href="#"
                >
                  <FaLinkedin />
                </a>
              </li>
              <li>
                <a
                  className="w-9.5 h-9.5 max-md:w-7 text-black max-md:h-7 hover:bg-black hover:text-white flex justify-center items-center bg-white rounded-full"
                  href="https://www.github.com/aloneiing5388"
                >
                  <AiFillGithub />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full flex text-xs flex-wrap max-md:text-[8px] justify-center items-center text-slate-700 mx-auto py-5 text-center">
        <span>
          Copyright ©{new Date().getFullYear()} All rights reserved | made by{" "}
          <a className="text-blue-500 underline" href="htttps://www.nasi.tech">
            @ Nasi Digital PVT LTD
          </a>
        </span>
      </div>
      <div className="hidden fixed max-md:block w-12.5 bottom-3 h-27.5 right-2 bg-white rounded-full z-10 p-2">
        <div className="w-full h-full flex gap-3 flex-col justify-center items-center">
          <div className="relative flex justify-center items-center cursor-pointer w-8.75 h-8.75 rounded-full bg-[#e2e2e2]">
            <span className="text-xl text-purple-600">
              <AiFillShopping />
            </span>
            {cartCount > 0 && (
              <div
                onClick={() => router.push(userInfo ? "/cart" : "login")}
                className="w-5 h-5 absolute bg-red-700 rounded-full text-xs text-white flex justify-center items-center -top-0.75 -right-1.25"
              >
                {cartCount}
              </div>
            )}
          </div>
          <div className="relative flex justify-center items-center cursor-pointer w-8.75 h-8.75 rounded-full bg-[#e2e2e2]">
            <span className="text-xl text-pink-600">
              <AiFillHeart />
            </span>
            {wishlistCount > 0 && (
              <div
                onClick={() =>
                  router.push(userInfo ? "/dashboard/wishlist" : "login")
                }
                className="w-5 h-5 absolute bg-red-700 rounded-full text-xs text-white flex justify-center items-center -top-0.75 -right-1.25"
              >
                {wishlistCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
