"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import SkeletonCategory from "@/components/Skeletons/SkeletonCategory";

const Categors = () => {
  const { categorys, loader } = useAppSelector((state) => state.home);
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

  const skeletonArray = Array.from({ length: 12 });

  return (
    <div className="flex w-full mx-auto relative">
      <Carousel
        plugins={[plugin.current]}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {loader
            ? skeletonArray.map((_, i) => (
                <CarouselItem
                  key={i}
                  className="gap-x-4 basis-[25%] lg:basis-[10%] md:basis-[17%]"
                >
                  <SkeletonCategory />
                </CarouselItem>
              ))
            : categorys?.map((c: any, i: number) => (
                <CarouselItem
                  key={i}
                  className="gap-x-4 basis-[25%] lg:basis-[10%] md:basis-[17%]"
                >
                  <Link
                    className="block p-0.5 border w-full rounded-md bg-slate-200 aspect-square"
                    href={`/products?category=${c.name}`}
                  >
                    <div className="w-full hover:shadow-[1px_3px_19px_1px_rgba(194,188,194,1)] h-full gap-y-2 flex-col relative flex justify-center items-center">
                      <div className="relative w-[50%] aspect-square">
                        <Image
                          src={c.image}
                          className="object-contain"
                          alt={c.name}
                          fill
                          sizes="80px"
                        />
                      </div>
                      <div className="bottom-6 w-full mx-auto font-bold left-0 flex justify-center items-center">
                        <span className="py-px md:text-[10px] text-[8px] lg:text-xs px-4">
                          {c.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default Categors;
