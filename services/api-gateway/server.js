const { createServer } = require("http");
const path = require("path");
const next = require("next");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const isProdArg = process.argv.includes("--prod");
const dev = !isProdArg;
const host = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const authServiceBase = (process.env.AUTH_SERVICE_URL || "http://localhost:4001").replace(/\/$/, "");
const appDir = path.join(__dirname, "..", "..", "apps", "client-web");

const app = next({ dev, webpack: true, dir: appDir });
const handle = app.getRequestHandler();
const onlineUsers = new Map();
const AUTH_PROXY_HEADER = "x-auth-service-proxy";

function collectRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(chunks.length > 0 ? Buffer.concat(chunks) : null));
    req.on("error", reject);
  });
}

function copySetCookie(upstreamHeaders, res) {
  if (typeof upstreamHeaders.getSetCookie === "function") {
    const cookies = upstreamHeaders.getSetCookie();
    if (cookies.length > 0) {
      res.setHeader("Set-Cookie", cookies);
    }
    return;
  }

  const cookieHeader = upstreamHeaders.get("set-cookie");
  if (cookieHeader) {
    res.setHeader("Set-Cookie", cookieHeader);
  }
}

function buildProxyHeaders(req, rawBody) {
  const headers = {
    accept: req.headers.accept || "application/json",
  };

  if (req.headers["content-type"]) {
    headers["content-type"] = req.headers["content-type"];
  }

  if (req.headers.authorization) {
    headers.authorization = req.headers.authorization;
  }

  if (req.headers.cookie) {
    headers.cookie = req.headers.cookie;
  }

  if (rawBody) {
    headers["content-length"] = rawBody.length.toString();
  }

  return headers;
}

function shouldForwardAuth(req) {
  const reqUrl = req.url || "/";
  return reqUrl.startsWith("/api/auth/") && req.headers[AUTH_PROXY_HEADER] !== "1";
}

async function forwardAuthRequest(req, res) {
  const rawBody = await collectRawBody(req);
  const upstreamUrl = `${authServiceBase}${req.url}`;
  const upstreamResponse = await fetch(upstreamUrl, {
    method: req.method || "GET",
    headers: buildProxyHeaders(req, rawBody),
    body: rawBody,
  });

  const bodyText = await upstreamResponse.text();
  res.statusCode = upstreamResponse.status;
  res.setHeader(
    "Content-Type",
    upstreamResponse.headers.get("content-type") || "application/json",
  );
  copySetCookie(upstreamResponse.headers, res);
  res.end(bodyText);
}

app
  .prepare()
  .then(() => {
    const httpServer = createServer(async (req, res) => {
      if (shouldForwardAuth(req)) {
        try {
          await forwardAuthRequest(req, res);
        } catch (error) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              service: "api-gateway",
              error: "Auth service request failed",
              details: error instanceof Error ? error.message : "Unknown error",
            }),
          );
        }
        return;
      }

      handle(req, res);
    });

    const io = new Server(httpServer, {
      path: "/socket.io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    global.chatIO = io;

    io.use((socket, nextAuth) => {
      try {
        const authToken = socket.handshake.auth?.token;
        const headerValue = socket.handshake.headers?.authorization;
        const bearerToken =
          typeof headerValue === "string" && headerValue.startsWith("Bearer ")
            ? headerValue.slice(7)
            : "";

        const token = authToken || bearerToken;
        if (!token) {
          return nextAuth(new Error("Unauthorized"));
        }

        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_jwt_secret",
        );

        if (!payload || !payload.id || !payload.role) {
          return nextAuth(new Error("Unauthorized"));
        }

        socket.data.user = {
          id: String(payload.id),
          role: String(payload.role),
          name: String(payload.name || "User"),
        };

        return nextAuth();
      } catch (error) {
        return nextAuth(new Error("Unauthorized"));
      }
    });

    io.on("connection", (socket) => {
      const user = socket.data.user;
      socket.join(`user:${user.id}`);

      const currentCount = onlineUsers.get(user.id) || 0;
      onlineUsers.set(user.id, currentCount + 1);
      io.emit("presence:update", { userId: user.id, online: true });

      socket.on("chat:join", ({ conversationId }) => {
        if (conversationId) {
          socket.join(`conversation:${conversationId}`);
        }
      });

      socket.on("chat:leave", ({ conversationId }) => {
        if (conversationId) {
          socket.leave(`conversation:${conversationId}`);
        }
      });

      socket.on("chat:typing", ({ conversationId, isTyping }) => {
        if (!conversationId) return;
        socket.to(`conversation:${conversationId}`).emit("chat:typing", {
          conversationId,
          userId: user.id,
          name: user.name,
          isTyping: Boolean(isTyping),
        });
      });

      socket.on("presence:sync-request", ({ userIds }) => {
        if (!Array.isArray(userIds)) return;
        const statuses = {};
        for (const id of userIds) {
          statuses[id] = (onlineUsers.get(String(id)) || 0) > 0;
        }
        socket.emit("presence:sync", { statuses });
      });

      socket.on("disconnect", () => {
        const count = onlineUsers.get(user.id) || 0;
        if (count <= 1) {
          onlineUsers.delete(user.id);
          io.emit("presence:update", { userId: user.id, online: false });
        } else {
          onlineUsers.set(user.id, count - 1);
        }
      });
    });

    httpServer.listen(port, host, () => {
      console.log(
        `> Server ready on http://${host === "0.0.0.0" ? "localhost" : host}:${port}`,
      );
      console.log(`> Next mode: ${dev ? "development" : "production"}`);
    });
  })
  .catch((err) => {
    console.error("Server boot error:", err);
    process.exit(1);
  });
