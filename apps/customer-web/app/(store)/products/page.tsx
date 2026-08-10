import Link from "next/link";
import SearchPro from "@/components/StoreComponents/SearchPro";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Suspense } from "react";

const CategoryShops = () => {
  return (
    <div>
      <div className="max-w-360 mx-auto px-4 sm:px-5 md:px-10 lg:px-12">
        <section
          style={{ backgroundImage: 'url("/images/banner/shop.gif")' }}
          className="h-42.5 sm:h-50 mt-6 bg-cover bg-no-repeat relative bg-left"
        >
          <div className="absolute left-0 top-0 w-full h-full bg-[#2422228a]">
            <div className="w-full h-full mx-auto">
              <div className="flex flex-col justify-center gap-1 items-center h-full w-full text-white">
                <h2 className="text-xl font-bold">Catogerys</h2>
                <div className="flex justify-center max-md:text-sm items-center gap-2 text-2xl w-full">
                  <Link href="/">Home</Link>
                  <span className="pt-1">
                    <MdOutlineKeyboardArrowRight />
                  </span>
                  <span>Products</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Suspense
        fallback={
          <div className="max-w-360 mx-auto px-5 lg:px-12 md:px-10 py-8" />
        }
      >
        <SearchPro />
      </Suspense>
    </div>
  );
};

export default CategoryShops;
