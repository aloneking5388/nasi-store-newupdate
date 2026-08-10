export interface LoginResponse {
  token: string;
  userInfo: UserInfo | null;
  message: string;
}

export interface logoutResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
}

export interface AuthState {
  successMessage: string;
  errorMessage: string;
  loader: boolean;
  userInfo: UserInfo | null;
  role: string;
  token: string | null;
}

export interface UserInfo {
  id: string;
  role: string;
  name: string;
  email: string;
  status?: string;
  customerType?: "normal" | "subscription";
  profileImage?: string;
  payment?: string;
  earnings?: number;
  shopInfo?: ShopInfo;
  referredBy?: string;
  referralCode?: string;
  referralCount?: number;
  shippingInfo?: ShippingInfo;
}

export interface DecodedToken extends JwtPayload {
  id?: string;
  role: Role;
  name?: string;
  email?: string;
  status?: string;
  customerType?: "normal" | "subscription";
  profileImage?: string;
  exp?: number;
}

export interface ProfileImagePayload {
  image: File | Blob;
}

export interface ProfileInfoPayload {
  name: string;
  phone?: string;
  address?: string;
  about?: string;
}

export interface ProfileInfoInput {
  shopInfo: {
    shopName: string;
    division: string;
    district: string;
    sub_district: string;
  };
}

export interface ProfileUpdateResponse {
  message: string;
  updatedUser?: UserInfo;
}
