// utils/api-middleware.ts
import { getTokenFromHeaders } from "@/utils/getToken";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { DecodedToken } from "@nasi/types/auth";

// Generic function to check role
const checkRole = (
  req: NextRequest,
  role: "admin" | "seller" | "customer" | "user",
): DecodedToken | NextResponse => {
  const token = getTokenFromHeaders(req.headers);

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: no token" },
      { status: 401 },
    );
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== role) {
    return NextResponse.json(
      { error: "Unauthorized: invalid role" },
      { status: 401 },
    );
  }

  return decoded;
};

// Export role-based check functions
export const isAdmin = (req: NextRequest): DecodedToken | NextResponse => {
  return checkRole(req, "admin");
};

export const isSeller = (req: NextRequest): DecodedToken | NextResponse => {
  return checkRole(req, "seller");
};

export const isCustomer = (req: NextRequest): DecodedToken | NextResponse => {
  return checkRole(req, "customer"); // or "user" if you prefer
};
