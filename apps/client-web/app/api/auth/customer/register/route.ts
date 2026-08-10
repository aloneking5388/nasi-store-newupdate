const authServiceBase = (
  process.env.AUTH_SERVICE_URL || "http://localhost:4001"
).replace(/\/$/, "");

export async function POST(req: Request) {
  const url = new URL(req.url);
  const targetUrl = `${authServiceBase}/api/auth/customer/register${url.search}`;
  const body = await req.text();

  const upstreamResponse = await fetch(targetUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": req.headers.get("content-type") || "application/json",
      cookie: req.headers.get("cookie") || "",
    },
    body,
  });

  const responseBody = await upstreamResponse.text();
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

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers,
  });
}
