import Cart from "@/components/StoreComponents/Cart";
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const CardPage = () => {
  return (
    <div className="max-w-[1440px] mx-auto lg:px-12 px-5 md:px-10 ">
      <section
        style={{ backgroundImage: 'url("/images/banner/card.jpg")' }}
        className="h-[220px] mt-6 bg-no-repeat bg-center bg-cover relative"
      >
        <div className="absolute left-0 top-0 w-full h-full bg-[#2422228a]">
          <div className="w-full h-full mx-auto">
            <div className="flex flex-col justify-center gap-1 items-center h-full w-full text-white">
              <h2 className="text-3xl font-bold">Shop.my</h2>
              <div className="flex justify-center items-center gap-2 max-md:text-md text-2xl w-full">
                <Link href="/">Home</Link>
                <span className="pt-2">
                  <MdOutlineKeyboardArrowRight />
                </span>
                <span>Card</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <Cart />
      </section>
    </div>
  );
};

export default CardPage;
