import Categorys from "@/components/StoreComponents/Categorys";
import Banner from "@/components/StoreComponents/Banner";
import HomeDataHydrator from "@/components/StoreComponents/HomeDataHydrator";
import { getHomeData } from "@/lib/homeData";
import dynamic from "next/dynamic";

const FeatureProducts = dynamic(
  () => import("@/components/StoreComponents/FeatureProducts"),
);
const Product = dynamic(() => import("@/components/StoreComponents/Product"));

export default async function Home() {
  const homeData = await getHomeData();

  return (
    <main className="w-full">
      <HomeDataHydrator data={homeData} />
      <Banner />
      <div className="lg:my-4 my-1 max-w-360 mx-auto px-5 md:px-10 lg:px-16">
        <Categorys />
      </div>
      <div className="lg:py-11.25 py-2 max-w-360 mx-auto px-5 md:px-10 lg:px-16">
        <FeatureProducts />
      </div>
      <div className="py-10">
        <div className="max-w-360 mx-auto px-5 md:px-10 lg:px-10 flex flex-wrap">
          <Product />
        </div>
      </div>
    </main>
  );
}
