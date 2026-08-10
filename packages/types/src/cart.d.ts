export interface CartWishlistState {
  loader: boolean
  cartItems: any[]
  wishlistItems: any[]
  cartCount: number
  wishlistCount: number
  buyProductItem: number
  totalWithTax: number
  tax: number
  price: number
  outOfStockProducts: any[]
  successMessage: string
  errorMessage: string
  shippingDetails: ShippingDetails
}

export interface ResponseMessage {
  message: string
}

export interface ProductPayload {
  productId: string
  quantity?: number
  userId?: string
}

export interface CartResponse {
  cartItems: SellerCart[];
  outOfStockProducts: any[];
  buyProductItem: number;
  price: number;
  tax: number;
  totalWithTax: number;
  shippingFee: number;
  cardProductCount: number;
}

export interface WishlistPayload {
  productId: string
  userId: string
  name: string
  price: number
  image: string
  discount: number
  rating: number
  slug: string
}

export interface CartGroup {
  _id: string;
  shopName: string;
  products: CartProduct[];
  shippingFee?: number;
  shippingMethod?: string;
  sellerId: string;
}

export interface CartProduct {
  _id: string;
  quantity: number;
  products: Product[];
  productInfo: {
    name: string;
    brand: string;
    price: number;
    discount: number;
    stock: number;
    images: string[];
  };
}