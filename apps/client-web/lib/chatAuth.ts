import { Headers } from "next/dist/compiled/@edge-runtime/primitives";
import jwt from "jsonwebtoken";
import { getTokenFromHeaders } from "@/utils/getToken";

export interface ChatAuthUser {
  id: string;
  role: "user" | "seller" | "admin";
  name: string;
  email?: string;
  profileImage?: string;
}

export const getChatUserFromHeaders = (
  headers: Headers,
): ChatAuthUser | null => {
  const token = getTokenFromHeaders(headers as unknown as globalThis.Headers);
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret",
    ) as Partial<ChatAuthUser>;

    if (!decoded?.id || !decoded?.role || !decoded?.name) return null;

    return {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
      profileImage: decoded.profileImage,
    };
  } catch {
    return null;
  }
};
