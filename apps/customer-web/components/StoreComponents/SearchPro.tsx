"use client";

import {
  price_range_product,
  query_products,
} from "@/store/products/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Range } from "react-range";
import Rating from "./Retings";
import Products from "./Products";
import { FaThList } from "react-icons/fa";
import Pagination from "@/components/DashboardComponents/Pagination";
import { BsFillGridFill } from "react-icons/bs";
import DynamicProductList from "./DynamicProductList";
import { formatPrice } from "@/utils/formatPrice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";

const SearchPro = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const searchValue = searchParams.get("searchValue") || "";
  const { products, totalProduct, priceRange, parPage, loader } =
    useAppSelector((state) => state.product);
  const { latest_product } = useAppSelector((state) => state.home);
  const { formatCurrency } = useCurrency();

  const dispatch = useAppDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [styles, setStyles] = useState("grid");
  const [filter, setFilter] = useState(false);
  const [state, setState] = useState({
    values: [0, 100],
  });
  const [rating, setRatingQ] = useState(0);
  const [sortPrice, setSortPrice] = useState<
    "low-to-high" | "high-to-low" | undefined
  >(undefined);

  const [rangeData, setRangeData] = useState<{ low: number; high: number }>({
    low: 0,
    high: 0,
  });

  useEffect(() => {
    dispatch(price_range_product());
  }, [dispatch]);

  useEffect(() => {
    const safeLow = Math.max(priceRange.low, 1);
    const safeHigh = Math.max(priceRange.high, safeLow + 1);
    if (safeLow === safeHigh) {
      setRangeData({
        low: safeLow,
        high: safeHigh + 100,
      });
    } else {
      setRangeData({
        low: safeLow,
        high: safeHigh,
      });
    }
    setState({ values: [safeLow, safeHigh] });
  }, [priceRange]);

  useEffect(() => {
    const [low, high] = state.values;
    dispatch(
      query_products({
        low,
        high,
        category,
        rating,
        sortPrice,
        pageNumber,
        searchValue,
      }),
    );
  }, [state.values, category, rating, sortPrice, pageNumber, searchValue]);

  const resetRating = () => {
    setRatingQ(0);
    dispatch(
      query_products({
        low: state.values[0],
        high: state.values[1],
        category,
        rating: 0,
        sortPrice,
        pageNumber,
      }),
    );
  };

  return (
    <div>
      <section className="py-8">
        <div className="max-w-360 mx-auto px-4 sm:px-5 md:px-10 lg:px-12">
          <div className={`${!filter ? "mb-6" : "mb-3"}`}>
            <button
              onClick={() => setFilter(!filter)}
              className="text-center rounded-md w-full md:w-4/12 lg:w-3/12 py-2 px-3 bg-purple-400 text-white"
            >
              Filter Product
            </button>
          </div>
          <div className="w-full flex flex-wrap">
            <div
              className={`flex flex-col w-full md:w-4/12 lg:w-3/12 pr-0 md:pr-8 transition-all duration-300 ${
                filter
                  ? "h-0 overflow-hidden mb-6"
                  : "h-auto overflow-auto mb-6 md:mb-0"
              }`}
            >
              <div className="py-2 flex flex-col gap-2">
                <h2 className="text-lg font-bold mb-3 text-slate-600">Price</h2>
                {rangeData && (
                  <Range
                    step={1}
                    min={rangeData?.low > 0 ? rangeData?.low : 1}
                    max={rangeData?.high > 0 ? rangeData?.high : 100}
                    values={[
                      Math.max(
                        state.values[0],
                        rangeData.low > 0 ? rangeData.low : 1,
                      ),
                      Math.max(state.values[1], state.values[0] + 1),
                    ]}
                    onChange={(values) => setState({ values })}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        className="flex mx-2 w-full h-1.5 bg-slate-200 rounded-full cursor-default"
                      >
                        {children}
                      </div>
                    )}
                    renderThumb={({ props }) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          key={key}
                          className="w-3.75 h-3.75 bg-blue-500 rounded-full"
                          {...restProps}
                        />
                      );
                    }}
                  />
                )}
                <div>
                  <span className="text-red-500 font-bold text-lg">
                    {formatCurrency(Math.floor(state.values[0]))} -{" "}
                    {formatCurrency(Math.floor(state.values[1]))}
                  </span>
                </div>
              </div>
              <div className="py-3 flex flex-col gap-2">
                <h2 className="text-xl font-bold mb-3 text-slate-600">
                  Rating
                </h2>
                <div className="flex flex-col gap-3">
                  <Rating
                    size="large"
                    type="selector"
                    rating={5}
                    onClick={() => setRatingQ(5)}
                  />
                  <Rating
                    size="large"
                    type="selector"
                    rating={4}
                    onClick={() => setRatingQ(4)}
                  />
                  <Rating
                    size="large"
                    type="selector"
                    rating={3}
                    onClick={() => setRatingQ(3)}
                  />
                  <Rating
                    size="large"
                    type="selector"
                    rating={2}
                    onClick={() => setRatingQ(2)}
                  />
                  <Rating
                    size="large"
                    type="selector"
                    rating={1}
                    onClick={() => setRatingQ(1)}
                  />
                  <Rating
                    size="large"
                    type="selector"
                    rating={0}
                    onClick={resetRating}
                  />
                </div>
              </div>
              <div className="py-5 lg:flex flex-col gap-4 hidden">
                <Products
                  title="Latest Products"
                  products={latest_product}
                  loader={loader}
                />
              </div>
            </div>
            <div className="md:w-8/12 lg:w-9/12 w-full">
              <div className="md:pl-8 pl-0">
                <div className="py-2 bg-slate-100 mb-10 px-3 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-3 border">
                  <h2 className="text-lg font-medium text-slate-600">
                    {totalProduct ?? 0} Products
                  </h2>
                  <div className="flex w-full sm:w-auto justify-start sm:justify-center items-center gap-2">
                    <select
                      onChange={(e) =>
                        setSortPrice(
                          e.target.value as
                            | "low-to-high"
                            | "high-to-low"
                            | undefined,
                        )
                      }
                      className="p-1 rounded-md border bg-slate-200 outline-0 text-slate-600 font-semibold w-full sm:w-auto"
                      name=""
                      id=""
                    >
                      <option value="">Sort By</option>
                      <option value="low-to-high">Low to High Price</option>
                      <option value="high-to-low">High to Low Price</option>
                    </select>
                    <div className="lg:flex justify-center items-start gap-2 hidden">
                      <div
                        onClick={() => setStyles("grid")}
                        className={`p-2 ${
                          styles === "grid" && "bg-slate-300"
                        } text-slate-600 hover:bg-slate-300 cursor-pointer rounded-sm`}
                      >
                        <BsFillGridFill />
                      </div>
                      <div
                        onClick={() => setStyles("list")}
                        className={`p-2 ${
                          styles === "list" && "bg-slate-300"
                        } text-slate-600 hover:bg-slate-300 cursor-pointer rounded-sm`}
                      >
                        <FaThList />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pb-8">
                  {styles === "grid" ? (
                    <DynamicProductList
                      products={products}
                      loader={loader}
                      layout="grid"
                      showTitle={true}
                      titleText="Category Products"
                      showDiscount={true}
                    />
                  ) : (
                    <DynamicProductList
                      products={products}
                      loader={loader}
                      layout="list"
                      showTitle={false}
                      showDiscount={false}
                    />
                  )}
                </div>
                <div>
                  {totalProduct > parPage && (
                    <Pagination
                      pageNumber={pageNumber}
                      setPageNumber={setPageNumber}
                      totalItem={totalProduct}
                      parPage={parPage}
                      showItem={Math.floor(totalProduct / parPage)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchPro;
