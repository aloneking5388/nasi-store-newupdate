"use client";
import Link from "next/link";
import { AiFillHeart, AiFillShopping } from "react-icons/ai";
import { FaList } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { IoIosCall } from "react-icons/io";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TopHeader from "./TopHeader";
import MobileSidebar from "./MobileSidebar";
import { getCartItems, getWishlistItems } from "@/store/cart/cartSlice";

const StoreHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { categorys } = useAppSelector((state) => state.home);
  const { userInfo } = useAppSelector((state) => state.auth);
  const { cartCount, wishlistCount } = useAppSelector((state) => state.cart);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showShidebar, setShowShidebar] = useState(false);
  const [categoryShow, setCategoryShow] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState("");
  const safeCategorys = mounted ? categorys : [];
  const safeUserInfo = mounted ? userInfo : null;
  const safeCartCount = mounted ? cartCount : 0;
  const safeWishlistCount = mounted ? wishlistCount : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const search = () => {
    if (searchValue) {
      router.push(
        `/products/search?category=${category}&searchValue=${searchValue}`,
      );
    } else {
      router.push(`/products?category=${category}`);
    }
  };

  useEffect(() => {
    if (safeUserInfo) {
      dispatch(getCartItems({ id: safeUserInfo.id }));
      dispatch(getWishlistItems({ id: safeUserInfo.id }));
    }
  }, [safeUserInfo, dispatch]);

  return (
    <div className="w-full bg-white lg:mb-2">
      <TopHeader />
      <div className="bg-white ">
        <div className="max-w-360 mx-auto px-5 md:px-8 mb-4">
          <div className="h-15 max-md:h-10 flex justify-between items-center flex-wrap">
            <div className="max-md:w-full w-3/12 max-sm:py-2 mb-2">
              <div className="flex justify-between items-center">
                <Link href="/">
                  <div className="relative w-65 h-25 max-md:w-45 max-md:h-17.25">
                    <Image
                      src="/images/logo.png"
                      alt="logo"
                      fill
                      sizes="(max-width: 768px) 180px, 260px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
                <div
                  className="justify-center items-center w-7.5 h-7.5 bg-white text-slate-600 border border-slate-600 rounded-sm cursor-pointer lg:hidden max-md:flex xl:hidden hidden"
                  onClick={() => setShowShidebar(!showShidebar)}
                >
                  <span>
                    <FaList />
                  </span>
                </div>
              </div>
            </div>
            <div className="max-md:w-full w-9/12">
              <div className="flex justify-between max-md:justify-center items-center flex-wrap lg:pl-10 xl:pl-14">
                <ul className="flex justify-start items-start gap-10 text-sm font-bold uppercase max-md:hidden">
                  <li>
                    <Link
                      href="/"
                      className={`p-2 block ${
                        pathname === "/" ? "premium-accent" : "text-slate-600"
                      }`}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop"
                      className={`p-2 block ${
                        pathname === "/shop"
                          ? "premium-accent"
                          : "text-slate-600"
                      }`}
                    >
                      Shops
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className={`p-2 block ${
                        pathname === "/blog"
                          ? "premium-accent"
                          : "text-slate-600"
                      }`}
                    >
                      Blogs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className={`p-2 block ${
                        pathname === "/about"
                          ? "premium-accent"
                          : "text-slate-600"
                      }`}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className={`p-2 block ${
                        pathname === "/contact"
                          ? "premium-accent"
                          : "text-slate-600"
                      }`}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
                <div className="flex max-md:hidden justify-center mr-15 items-center gap-4">
                  <div className="flex justify-center gap-4">
                    <div
                      onClick={() =>
                        router.push(
                          safeUserInfo ? "/dashboard/wishlist" : "/login",
                        )
                      }
                      className="relative flex justify-center items-center cursor-pointer w-8.75 h-8.75 rounded-full bg-[#e2e2e2]"
                    >
                      <span className="text-xl text-pink-600">
                        <AiFillHeart />
                      </span>
                      {safeWishlistCount !== 0 && (
                        <div className="w-4.5 h-4.5 absolute bg-red-700 rounded-full text-white font-semibold flex text-xs justify-center items-center -top-0.75 -right-1.25">
                          {safeWishlistCount}
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() =>
                        router.push(safeUserInfo ? "/cart" : "/login")
                      }
                      className="relative flex justify-center items-center cursor-pointer w-8.75 h-8.75 rounded-full bg-[#e2e2e2]"
                    >
                      <span className="text-xl premium-accent">
                        <AiFillShopping />
                      </span>

                      {safeCartCount !== 0 && (
                        <div className="w-4.5 h-4.5 absolute bg-red-700 rounded-full text-white font-semibold text-xs flex justify-center items-center -top-0.75 -right-1.25">
                          {safeCartCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileSidebar
        showShidebar={showShidebar}
        setShowShidebar={setShowShidebar}
      />
      <div className="max-w-360 mx-auto px-5 md:px-8 pt-2.5">
        <div className="flex w-full flex-wrap max-md:gap-4">
          <div className="w-3/12 max-md:w-full">
            <div className="bg-white relative">
              <div
                onClick={() => setCategoryShow(!categoryShow)}
                className="h-10 rounded-xl premium-btn text-white flex justify-center max-md:justify-between max-md:px-6 items-center gap-3 font-bold text-md cursor-pointer"
              >
                <div className="flex justify-center items-center gap-3">
                  <span>
                    <FaList />
                  </span>
                  <span>All Category</span>
                </div>
                <span className="pt-1">
                  <MdOutlineKeyboardArrowDown />
                </span>
              </div>
              <div
                className={`${
                  categoryShow ? "h-0" : "h-100"
                } overflow-hidden rounded-xl transition-all max-md:relative duration-500 absolute z-99999 bg-white w-full border-x`}
              >
                <ul className="py-2 text-slate-600 font-medium h-full overflow-auto">
                  {safeCategorys.map((c, i) => {
                    return (
                      <li
                        key={i}
                        className="flex justify-start items-center gap-2 px-6 py-1.5"
                      >
                        <Image
                          src={c.image}
                          className="rounded-full overflow-hidden"
                          alt={c.name}
                          width={30}
                          height={30}
                        />
                        <Link
                          href={`/products?category=${c.name}`}
                          className="text-sm block"
                          onClick={() => setCategoryShow(!categoryShow)}
                        >
                          {c.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="w-9/12 pl-8 max-md:pl-0 max-md:w-full">
            <div className="flex flex-wrap w-full justify-between items-center max-md:gap-6">
              <div className="w-8/12 max-md:w-full">
                <div className="flex border h-10 rounded-xl items-center relative gap-5">
                  <div className="relative after:absolute after:h-6.25 after:w-px after:bg-[#afafaf] after:-right-3.75 max-md:hidden">
                    <select
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-37.5 text-slate-600 font-semibold bg-transparent px-2 h-full outline-0 border-none"
                      name=""
                      id=""
                    >
                      <option value="">Select category</option>
                      {safeCategorys.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    className="w-full relative bg-transparent text-slate-500 outline-0 px-3 h-full"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchValue(e.target.value)
                    }
                    value={searchValue}
                    type="text"
                    name=""
                    id=""
                    placeholder="what do you need"
                  />
                  <Button
                    onClick={search}
                    className="premium-btn rounded-r-xl right-0 absolute px-8 h-full font-semibold uppercase"
                  >
                    Search
                  </Button>
                </div>
              </div>
              <div className="w-4/12 block max-md:hidden pl-2 max-md:w-full max-md:pl-0">
                <div className="w-full flex justify-end max-md:justify-start gap-3 items-center">
                  <div className="w-10 h-10 rounded-full flex premium-soft justify-center items-center">
                    <span>
                      <IoIosCall className="premium-accent" />
                    </span>
                  </div>
                  <div className="flex justify-end flex-col gap-1">
                    <h2 className="text-sm font-bold text-slate-700">
                      +91 (635) 600 1885
                    </h2>
                    <span className="text-xs font-semibold">
                      support 24/7 time
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;
