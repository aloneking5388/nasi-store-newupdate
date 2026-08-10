export interface AdminDashboardState {
  successMessage: string;
  errorMessage: string;
  loader: boolean;
  sellers: any[];
  totalSellers: number;
  seller: any | null;
  customers: any[];
  totalCustomers: number;
  customer: any | null;
}

export interface SellerCustomerListResponse {
  sellers: Seller[];
  totalSellers: number;
  customers: Customer[];
  totalCustomers: number;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  status: string;
}
export interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  referredBy: string;
  profileImage: string;
  level: string;
  bellence: number;
}
