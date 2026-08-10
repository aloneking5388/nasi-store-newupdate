import { DecodedToken } from "@nasi/types/auth";
import { jwtDecode } from "jwt-decode";

export const returnUserInfo = (
  token: string | null,
): {
  id: string;
  role: string;
  name: string;
  status?: string;
  email: string;
  customerType?: "normal" | "subscription";
  profileImage?: string;
} | null => {
  if (typeof window === "undefined" || !token) return null;

  if (token.split(".").length !== 3) {
    localStorage.removeItem("accessToken");
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (!decoded.exp || new Date().getTime() > decoded.exp * 1000) {
      localStorage.removeItem("accessToken");
      return null;
    }

    return {
      id: decoded.id || "",
      role: decoded.role || "",
      name: decoded.name || "",
      email: decoded.email || "",
      status: decoded.status,
      customerType: decoded.customerType,
      profileImage: decoded.profileImage || "",
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const returnRole = (token: string | null): string => {
  const user = returnUserInfo(token);
  return user?.role || "";
};
