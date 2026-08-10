import { NextRequest } from "next/server";

const authServiceBase = (
  process.env.AUTH_SERVICE_URL || "http://localhost:4001"
).replace(/\/$/, "");

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const targetUrl = `${authServiceBase}/api/auth/logout${url.search}`;

  const upstreamResponse = await fetch(targetUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
      cookie: req.headers.get("cookie") || "",
    },
  });

  const body = await upstreamResponse.text();
  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstreamResponse.headers.get("content-type") || "application/json",
  );

  const setCookieHeaders =
    typeof (upstreamResponse.headers as any).getSetCookie === "function"
      ? (upstreamResponse.headers as any).getSetCookie()
      : [];

  if (setCookieHeaders.length > 0) {
    headers.set("Set-Cookie", setCookieHeaders.join(", "));
  } else {
    const cookieHeader = upstreamResponse.headers.get("set-cookie");
    if (cookieHeader) {
      headers.set("Set-Cookie", cookieHeader);
    }
  }

  return new Response(body, {
    status: upstreamResponse.status,
    headers,
  });
}
