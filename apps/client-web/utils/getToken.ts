export function getTokenFromHeaders(headers: Headers): string | null {
    const auth = headers.get("authorization");
    if (!auth) return null;
    const token = auth.split(" ")[1];
    return token || null;
  }
  