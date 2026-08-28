"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const http = require("http");

function httpPost(hostname, port, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname,
        port,
        path,
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(data),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            body: Buffer.concat(chunks).toString(),
            headers: res.headers,
          }),
        );
      },
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = mongoose.connection.db.collection("users");
  const email = "smoke-cust-" + Date.now() + "@example.com";
  const plain = "SmokePass123!";
  const hashed = await bcrypt.hash(plain, 10);
  const referralCode = "smk" + Date.now().toString().slice(-6);
  await users.insertOne({
    name: "Smoke Customer",
    email,
    password: hashed,
    referralCode,
    invested: 0,
    customerType: "normal",
    role: "user",
    status: "active",
    referralCount: 0,
    earnings: 0,
    downline: [],
    uplines: [],
    bonusesGiven: [],
  });

  try {
    const r1 = await httpPost("localhost", 4001, "/api/auth/customer/login", {
      email,
      password: plain,
    });
    console.log("SUCCESS_STATUS", r1.status);
    const parsed = JSON.parse(r1.body);
    console.log("FIELDS", Object.keys(parsed).join(", "));
    console.log("SUCCESS", parsed.success);
    console.log("MESSAGE", parsed.message);
    console.log(
      "USERINFO_KEYS",
      parsed.userInfo ? Object.keys(parsed.userInfo).join(", ") : "MISSING",
    );
    console.log("HAS_TOKEN", typeof parsed.token === "string");
    const rawCookie = r1.headers["set-cookie"];
    const cookieStr = Array.isArray(rawCookie)
      ? rawCookie[0]
      : String(rawCookie || "");
    console.log(
      "COOKIE_NAME",
      cookieStr.startsWith("token=") ? "token" : "WRONG_NAME",
    );
    console.log(
      "COOKIE_HTTPONLY",
      cookieStr.toLowerCase().includes("httponly") ? "YES" : "NO",
    );
    console.log(
      "COOKIE_SAMESITE",
      cookieStr.toLowerCase().includes("samesite=strict")
        ? "strict"
        : "MISSING",
    );

    const r2 = await httpPost("localhost", 4001, "/api/auth/customer/login", {
      email: "nobody@nowhere.invalid",
      password: "x",
    });
    console.log("NOT_FOUND_STATUS", r2.status, "BODY", r2.body.trim());

    const r3 = await httpPost("localhost", 4001, "/api/auth/customer/login", {
      email,
      password: "wrongpassword",
    });
    console.log("BAD_PASS_STATUS", r3.status, "BODY", r3.body.trim());
  } finally {
    await users.deleteOne({ email });
    await mongoose.disconnect();
  }
})().catch((err) => {
  console.error("SMOKE_ERROR", err.message);
  process.exit(1);
});
