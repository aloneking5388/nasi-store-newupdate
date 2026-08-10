// ✅ Safe for middleware.ts
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@nasi/types/auth";

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwtDecode(token) as DecodedToken;

    if (!decoded.exp || Date.now() > decoded.exp * 1000) {
      console.error("Token expired");
      return null;
    }

    return decoded;
  } catch (error: any) {
    console.error("Token decode failed:", error.message);
    return null;
  }
};
