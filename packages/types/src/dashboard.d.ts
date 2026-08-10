export interface DashboardData {
  user: User;
  walletBalance: number;
  recentOrders: any[]; // Replace `any` with a specific order interface if available
  totalOrders: number;
  orderCounts: {
    pending: number;
    paid: number;
    unpaid: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  customerType?: "normal" | "subscription";
  referralCode?: string;
  referralCount?: number;
}

export interface DashboardState {
  user: User | null;
  walletBalance: number;
  recentOrders: any[]; // Can be typed better
  errorMessage: string;
  successMessage: string;
  loader: boolean;
  totalOrders: number;
  orderCounts: {
    pending: number;
    paid: number;
    unpaid: number;
  };
}
