"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  buildSetTokenCookie,
  buildClearTokenCookie,
} = require("../../src/modules/auth/utils/cookie.service");

test("buildSetTokenCookie starts with token=<value>", () => {
  assert.ok(buildSetTokenCookie("abc").startsWith("token=abc"));
});

test("buildSetTokenCookie includes HttpOnly", () => {
  assert.ok(buildSetTokenCookie("t").includes("HttpOnly"));
});

test("buildSetTokenCookie includes Max-Age=604800", () => {
  assert.ok(buildSetTokenCookie("t").includes("Max-Age=604800"));
});

test("buildSetTokenCookie includes SameSite=Strict", () => {
  assert.ok(buildSetTokenCookie("t").includes("SameSite=Strict"));
});

test("buildSetTokenCookie includes Path=/", () => {
  assert.ok(buildSetTokenCookie("t").includes("Path=/"));
});

test("buildSetTokenCookie includes an Expires attribute", () => {
  // format is not asserted; presence is required
  assert.ok(buildSetTokenCookie("t").includes("Expires="));
});

test("buildSetTokenCookie does not include Secure outside production", () => {
  const saved = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  assert.ok(!buildSetTokenCookie("t").includes("Secure"));
  if (saved !== undefined) process.env.NODE_ENV = saved;
});

test("buildSetTokenCookie includes Secure in production", () => {
  process.env.NODE_ENV = "production";
  assert.ok(buildSetTokenCookie("t").includes("Secure"));
  delete process.env.NODE_ENV;
});

test("buildClearTokenCookie matches the exact logout cookie value", () => {
  assert.equal(
    buildClearTokenCookie(),
    "token=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/",
  );
});
