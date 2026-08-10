"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHomeData } from "@/store/Home/homeSlice";
import { HomeApiResponse } from "@nasi/types/home";

const HomeDataHydrator = ({ data }: { data: HomeApiResponse }) => {
  const dispatch = useAppDispatch();
  const banners = useAppSelector((state) => state.home.banners);

  useEffect(() => {
    if (banners.length === 0 && data) {
      dispatch(setHomeData(data));
    }
  }, [banners.length, data, dispatch]);

  return null;
};

export default HomeDataHydrator;
