export interface AddProductResponse {
  message: string;
  product: Product;
}

export interface UpdatProduct {
  productId: string;
  name: string;
  category?: string;
  subcategory?: string;
  brand: string;
  price: number;
  stock: number;
  discount: number;
  sizes?: string[];
  colors?: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceRange {
  low: number;
  high: number;
}

export interface ProductState {
  successMessage: string;
  errorMessage: string;
  loader: boolean;
  products: Product[];
  latest_product: Product[][];
  topRated_product: Product[][];
  discount_product: Product[][];
  relatedProducts: Product[];
  moreProducts: Product[];
  priceRange: PriceRange;
  product: Product | null;
  totalProduct: number;
  parPage: number;
  reviews: Review[];
  totalReview: number;
  totalPages: number;
  currentPage: number;
  rating_review: RatingCount[];
  sellerProducts: Product[];
  totalSellerProduct: number;
}

export interface Product {
  id: string;
  slug: string;
  sellerId: string;
  name: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number;
  stock: number;
  discount: number;
  description: string;
  shopName: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
  rating?: number;
}

export interface QueryParams {
  category?: string;
  rating?: number;
  low?: number;
  high?: number;
  sortPrice?: "low-to-high" | "high-to-low";
  pageNumber?: number;
  searchValue?: string;
}

export interface QueryProductsResponse {
  products: Product[];
  totalProduct: number;
  parPage: number;
}
