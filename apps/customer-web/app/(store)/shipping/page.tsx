import ShippingCart from "@/components/StoreComponents/ShippingCart";
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const page = () => {
  return (
    <div>
      <div className="bg-[#eeeeee] w-full">
        <div className="max-w-360 mx-auto md-lg:px-12 px-10 pt-6">
          <section
            style={{ backgroundImage: 'url("/images/banner/order.jpg")' }}
            className="h-55  bg-cover bg-no-repeat relative bg-left"
          >
            <div className="absolute left-0 top-0 w-full h-full bg-[#2422228a]">
              <div className="w-full h-full mx-auto">
                <div className="flex flex-col justify-center gap-1 items-center h-full w-full text-white">
                  <h2 className="text-3xl max-sm:text-xl font-bold">Shop.my</h2>
                  <div className="flex justify-center items-center gap-2 max-sm:text-lg text-2xl w-full">
                    <Link href="/">Home</Link>
                    <span className="pt-2">
                      <MdOutlineKeyboardArrowRight />
                    </span>
                    <span>Place Order</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ShippingCart />
    </div>
  );
};

export default page;
