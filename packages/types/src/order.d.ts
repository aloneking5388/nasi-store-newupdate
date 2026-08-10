export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  brand: string;
  discount: number;
  quantity: number;
  images: string;
}

export interface Order {
  _id: string;
  userId: string;
  price: number;
  shippingFee: number;
  shippingInfo: ShippingInfo;
  shippingMethodMap: { [sellerId: string]: string };
  items: number;
  products: OrderItem[];
  payment_status: string;
  delivery_status: string;
  date: string;
  createdAt: string;
  updatedAt: string;

}

export interface OrderState {
  orderId: string;
  totalPrice: number;
  items: number;
  loader: boolean;
  myOrders: Order[];
  myOrder: Order | null;
  errorMessage: string;
  successMessage: string;
}

export interface ShippingInfo {
  name: string;
  address: string;
  phone: string;
  post: string;
  province: string;
  city: string;
  area: string;
};