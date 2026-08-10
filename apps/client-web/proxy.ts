import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "./utils/jwt-decode";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const token = req.cookies.get("token")?.value;

  const publicRoutes = [
    "/",
    "/about",
    "/about-shops",
    "/about-delivery",
    "/about-group",
    "/returnpolicy",
    "/deliverypolicy",
    "/privacypolicy",
    "/blog",
    "/shop",
    "/contact",
    "/products",
    "/unsubscribe",
    "/products/search",
    "/login",
    "/register",
    "/admin/login",
    "/seller/login",
    "/seller/register",
  ];

  // ✅ Allow public routes and their sub-routes (like /products/slug)
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  if (isPublic) return NextResponse.next();

  // ❌ Token check
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  const decoded = decodeToken(token);
  if (!decoded) return NextResponse.redirect(new URL("/", req.url));

  const { role, status } = decoded;

  // ✅ Admin routes
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Seller routes
  if (pathname.startsWith("/seller")) {
    if (role !== "seller") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const allowedIfRestricted = ["/seller/profile", "/seller/chatsupport"];
    const restrictedRoutes = [
      "/seller/addProduct",
      "/seller/allproducts",
      "/seller/discountProduct",
      "/seller/orders",
      "/seller/payments",
    ];

    const isAllowed = allowedIfRestricted.some((route) =>
      pathname.startsWith(route),
    );
    const isRestricted = restrictedRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (["pending", "deactive"].includes(status || "")) {
      if (isAllowed) return NextResponse.next();
      if (isRestricted)
        return NextResponse.redirect(new URL("/seller/profile", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ✅ User dashboard
  if (pathname.startsWith("/dashboard")) {
    if (role !== "user") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (status !== "active") {
      return NextResponse.redirect(new URL("/pending-account", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|static|favicon.ico|manifest.webmanifest|sw.js|public|assets|images|fonts).*)",
  ],
};
