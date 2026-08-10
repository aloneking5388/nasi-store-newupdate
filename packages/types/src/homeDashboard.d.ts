export interface HomeDashboardState {
  loader: boolean;
  errorMessage: string;
  successMessage: string;
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  totalPendingOrders: number;
  monthlyCustomers: number[];
  monthlyRevenue: number[];
  monthlyOrders: number[];
  monthlySales: number[];
  order: OrderItem | null;
  orders: OrderItem[];
}

export interface GetOrdersArgs {
  page?: number;
  parPage?: number;
  searchValue?: string;
}

export interface GetOrdersResponse {
  orders: OrderItem[];
  totalDocs: number;
}

export interface OrderItem {
  _id: string;
  customerId: string;
  products: ProductItem[];
  quantity: number;
  price: number;
  date: string;
  payment_status: string;
  delivery_status: string;
  createdAt: string;
  suborder?: AuthorSuborder[];
  shippingInfo?: ShippingInfo;
}

export interface AuthorSuborder {
  _id: string;
  orderId: string;
  sellerId: string;
  products: ProductItem[];
  quantity: number;
  price: number;
  payment_status: string;
  delivery_status: string;
}

export interface ShippingInfo {
  name: string;
  address: string;
  phone: string;
  post: string;
  province: string;
  city: string;
  area: string;
}
