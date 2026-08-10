"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { get_Home_Data } from "@/store/Home/homeSlice";
import SkeletonBanner from "@/components/Skeletons/SkeletonBanner";

const Banner = () => {
  const dispatch = useAppDispatch();
  const { banners, loader } = useAppSelector((state) => state.home);
  const [mounted, setMounted] = useState(false);
  const hasBanners = banners && banners.length > 0;

  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !hasBanners) {
      dispatch(get_Home_Data());
    }
  }, [dispatch, hasBanners, mounted]);

  return (
    <div className="w-full max-sm:my-4">
      <div className="max-w-360 mx-auto px-4 md:px-10">
        <div className="w-full">
          <div className="lg:my-8 my-2">
            {!mounted || !hasBanners || loader ? (
              <SkeletonBanner />
            ) : (
              <Carousel
                plugins={[autoplayPlugin.current]}
                opts={{ loop: true }}
                className="w-full rounded-sm"
              >
                <CarouselContent>
                  {banners.map(({ banner, link }, index) => (
                    <CarouselItem key={index}>
                      <Link
                        href={`/products/${link}`}
                        className="block w-full sm:h-100 h-27.5 relative"
                      >
                        <Image
                          src={banner}
                          alt={`Banner ${index + 1}`}
                          fill
                          sizes="100vw"
                          priority={index === 0}
                          className="rounded-sm"
                        />
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
