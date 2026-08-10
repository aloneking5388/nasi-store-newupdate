import { unstable_cache } from "next/cache";
import Banner from "@/models/Benners";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { connectDB } from "@/utils/ConnectDB";

const formatProductsInRows = (products: any[]) => {
  const chunked: any[][] = [];
  for (let i = 0; i < products.length; i += 3) {
    chunked.push(products.slice(i, i + 3));
  }
  return chunked;
};

const fetchHomeData = async () => {
  await connectDB();

  const [
    banners,
    categories,
    newProducts,
    latestList,
    topRatedList,
    discountList,
  ] = await Promise.all([
    Banner.find({}).lean(),
    Category.find({}).lean(),
    Product.find({}).limit(10).sort({ createdAt: -1 }).lean(),
    Product.find({}).limit(9).sort({ createdAt: -1 }).lean(),
    Product.find({}).limit(9).sort({ rating: -1 }).lean(),
    Product.find({}).limit(9).sort({ discount: -1 }).lean(),
  ]);

  return {
    banners,
    categorys: categories,
    products: newProducts,
    latest_product: formatProductsInRows(latestList),
    topRated_product: formatProductsInRows(topRatedList),
    discount_product: formatProductsInRows(discountList),
  };
};

const getCachedHomeData = unstable_cache(fetchHomeData, ["home-data"], {
  revalidate: 120,
});

export const getHomeData = async () => getCachedHomeData();
