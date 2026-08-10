"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  addToCart,
  addToWishlist,
  cartMessageClear,
  setShippingDetails,
} from "@/store/cart/cartSlice";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import Rating from "./Retings";
import { formatPrice } from "@/utils/formatPrice";
import { Loader2 } from "lucide-react";
import { AiFillGithub, AiFillHeart, AiOutlineTwitter } from "react-icons/ai";
import Link from "next/link";
import { FaFacebookF, FaLinkedin } from "react-icons/fa";
import UniversalShareButtons from "./UniversalShareButtons";

const ProductDetail = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formatCurrency } = useCurrency();
  const [image, setImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const { product, loader } = useAppSelector((state) => state.product);
  const { totalReview } = useAppSelector((state) => state.review);
  const { successMessage, errorMessage } = useAppSelector(
    (state) => state.cart,
  );
  const { userInfo } = useAppSelector((state) => state.auth);

  const inc = () => {
    if (quantity >= (product?.stock ?? 0)) {
      toast.error("Out of stock");
    } else {
      setQuantity(quantity + 1);
    }
  };
  const dec = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getDiscountedPrice = () => {
    const price = product?.price ?? 0;
    const discount = product?.discount ?? 0;

    const discountedPrice = price - Math.floor((price * discount) / 100);
    return discountedPrice * quantity;
  };

  const getOriginalPrice = () => {
    const price = product?.price ?? 0;
    return price * quantity;
  };

  const redirectToLogin = () => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
    } else {
      router.push("/login");
    }
  };

  const buy = () => {
    if (!product) return;
    if (!userInfo) {
      redirectToLogin();
      return;
    }

    const discountPrice = product.discount
      ? product.price - (product.price * product.discount) / 100
      : product.price;

    const basePrice = discountPrice * quantity;
    const tax = basePrice * 0.18;
    const total = basePrice + tax;

    const obj = [
      {
        sellerId: product.sellerId,
        shopName: product.shopName,
        price: basePrice,
        products: [
          {
            quantity,
            productInfo: product,
          },
        ],
      },
    ];

    dispatch(
      setShippingDetails({
        products: obj,
        price: basePrice,
        tax,
        total,
        items: quantity,
      }),
    );

    router.push("/shipping");
  };

  const add_card = (_id: string) => {
    if (userInfo) {
      dispatch(
        addToCart({
          userId: userInfo.id,
          quantity: quantity,
          productId: _id,
        }),
      );
    } else {
      redirectToLogin();
    }
  };

  const add_wishlist = (product: any) => {
    if (userInfo) {
      dispatch(
        addToWishlist({
          userId: userInfo.id,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          discount: product.discount,
          rating: product.rating,
          slug: product.slug,
        }),
      );
    } else {
      redirectToLogin();
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(cartMessageClear());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(cartMessageClear());
    }
  }, [successMessage, errorMessage]);

  useEffect(() => {
    setSelectedSize(product?.sizes?.[0] || "");
    setSelectedColor(product?.colors?.[0] || "");
  }, [product?.id, product?.sizes, product?.colors]);

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 max-sm:gap-4 gap-8">
      <div className="flex flex-col justify-center items-center ">
        <Image
          className="aspect-square ml-3 border bg-slate-100 rounded-md shadow-md shadow-slate-100/50 border-slate-400"
          src={image || product?.images?.[0] || "/images/logo.png"}
          alt="product"
          width={380}
          height={380}
        />
        <div>
          <div className="py-3">
            {product?.images && (
              <Carousel>
                <CarouselContent>
                  {product.images.map((img, i) => (
                    <CarouselItem
                      key={i}
                      onClick={() => setImage(img)}
                      className="basis-1/4 cursor-pointer"
                    >
                      <Image
                        width={80}
                        height={80}
                        src={img}
                        alt={`Product image ${i}`}
                        className="aspect-square bg-purple-100 border hover:shadow-lg hover:shadow-purple-100/50 border-slate-300 rounded-md"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col max-sm:gap-2 gap-5">
        <div className="text-3xl max-sm:text-xl text-slate-600 font-bold">
          <h2>{product?.name}</h2>
        </div>
        <div className="flex justify-start items-center max-sm:gap-2 gap-4">
          <div className="flex max-sm:text-sm text-xl">
            <Rating size="medium" type="precise" rating={product?.rating} />
          </div>
          <span className="text-green-500">({totalReview} reviews)</span>
        </div>
        <div className="text-2xl max-sm:text-lg max-sm:gap-1 text-red-500 font-bold flex gap-3">
          {product?.discount !== 0 ? (
            <>
              <h2 className="line-through">{formatCurrency(product?.price)}</h2>
              <h2 className="text-black">
                {formatCurrency(getDiscountedPrice())}
              </h2>
              <h2>(-{product?.discount}%)</h2>
            </>
          ) : (
            <h2>Price : {formatCurrency(getOriginalPrice())}</h2>
          )}
        </div>
        {(product?.sizes?.length || 0) > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm text-slate-600 font-semibold">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product?.sizes?.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded border text-sm ${
                    selectedSize === size
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {(product?.colors?.length || 0) > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm text-slate-600 font-semibold">Color</h3>
            <div className="flex flex-wrap gap-2">
              {product?.colors?.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 rounded border text-sm ${
                    selectedColor === color
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {selectedSize || selectedColor ? (
          <p className="text-sm text-slate-600">
            {selectedSize ? `Selected Size: ${selectedSize}` : ""}
            {selectedSize && selectedColor ? " | " : ""}
            {selectedColor ? `Selected Color: ${selectedColor}` : ""}
          </p>
        ) : null}
        <div className="flex gap-3 pb-10 border-b">
          {product?.stock ? (
            <>
              <div className="flex bg-slate-200 h-12.5 max-sm:h-9.5 rounded-lg justify-center items-center text-xl">
                <div onClick={dec} className="px-6 max-md:px-3 cursor-pointer">
                  -
                </div>
                <div className="px-5 max-md:px-2">{quantity}</div>
                <div onClick={inc} className="px-6 max-md:px-3 cursor-pointer">
                  +
                </div>
              </div>
              <div>
                <button
                  onClick={() => add_card(product.id)}
                  className="lg:px-8 px-5 py-3 h-12.5 max-sm:h-9.5 max-md:text-[10px] rounded-lg cursor-pointer hover:shadow-lg hover:shadow-purple-500/40 bg-purple-500 text-white"
                >
                  {loader ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Add To Cart"
                  )}
                </button>
              </div>
            </>
          ) : (
            ""
          )}
          <div
            onClick={() => add_wishlist(product)}
            className="h-12.5 w-12.5 max-md:h-9.5 max-md:w-9.5 flex justify-center rounded-full items-center cursor-pointer hover:shadow-lg hover:shadow-pink-500/40 bg-pink-500 text-white"
          >
            <AiFillHeart />
          </div>
        </div>
        <div className="flex py-5 gap-5">
          <div className="w-37.5 text-black font-bold max-sm:text-lg text-xl flex flex-col gap-5">
            <span>Availability</span>
            <span>Share on</span>
          </div>
          <div className="flex flex-col max-md:gap-2 gap-5">
            <span className={`text-${product?.stock ? "green" : "red"}-500`}>
              {product?.stock ? `In Stock(${product?.stock})` : "Out of Stock"}
            </span>
            <UniversalShareButtons
              message={`Check out this amazing product: ${
                product?.name
              } for ${formatCurrency(product?.price)} only!`}
              url={`https://www.nasistore.com/product/details/${product?.slug}`}
            />
          </div>
        </div>
        <div className="flex gap-3">
          {product?.stock ? (
            <button
              onClick={buy}
              className="lg:px-8 px-4 max-sm:h-10 max-md:text-[12px] rounded-lg py-3 h-12.5 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/40 bg-emerald-500 text-white"
            >
              {loader ? <Loader2 className="animate-spin" /> : "Buy Now"}
            </button>
          ) : (
            ""
          )}
          <Link
            href={`/dashboard/chat/${product?.sellerId}`}
            className="lg:px-8 px-4 py-3 h-12.5 max-md:text-[12px] max-sm:h-10 rounded-lg cursor-pointer hover:shadow-lg hover:shadow-lime-500/40 bg-lime-500 text-white block"
          >
            Chat Seller
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
