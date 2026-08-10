"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";

const TopHeaderSlider = () => {
  const { latest_product } = useAppSelector((state) => state.home);

  const products = useMemo(() => latest_product.flat(), [latest_product]);

  if (!products.length) return null;

  return (
    <div className="flex items-center h-full max-w-175 overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={10}
        slidesPerView={4}
        loop
        autoplay={{ delay: 2000 }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="flex items-center gap-2">
              <img
                src={product.images?.[0] || "/placeholder.jpg"}
                alt={product.name}
                className="w-4 h-4 object-cover rounded"
              />
              <div className="flex flex-row justify-center text-xs gap-2">
                <span className="font-semibold">{product.name}</span>
                <span className="text-red-500 font-bold">
                  {product.discount > 0 ? `${product.discount}% OFF` : "New"}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TopHeaderSlider;
