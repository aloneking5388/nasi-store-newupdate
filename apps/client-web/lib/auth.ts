import { DecodedToken } from "@nasi/types/auth";
import jwt from "jsonwebtoken";

export const verifyToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as DecodedToken;

    if (!decoded.exp || Date.now() > decoded.exp * 1000) {
      console.error("Token expired");
      return null;
    }

    return decoded;
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};
