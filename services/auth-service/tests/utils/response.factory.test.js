"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  loginSuccess,
  notFound,
  unauthorized,
  serverError,
} = require("../../src/modules/auth/utils/response.factory");

// error responses must use "error" key — not "message" — to match existing contracts
test("notFound uses error key, not message key", () => {
  const r = notFound("Customer not found");
  assert.ok("error" in r.body, "must have error key");
  assert.ok(!("message" in r.body), "must not have message key");
});

test("notFound returns 404 with the supplied message", () => {
  const r = notFound("Customer not found");
  assert.equal(r.statusCode, 404);
  assert.equal(r.body.error, "Customer not found");
});

test("unauthorized uses error key, not message key", () => {
  const r = unauthorized("Invalid credentials");
  assert.ok("error" in r.body);
  assert.ok(!("message" in r.body));
});

test("unauthorized returns 401 with the supplied message", () => {
  const r = unauthorized("Invalid credentials");
  assert.equal(r.statusCode, 401);
  assert.equal(r.body.error, "Invalid credentials");
});

test("serverError returns 500 with fixed message", () => {
  const r = serverError();
  assert.equal(r.statusCode, 500);
  assert.equal(r.body.error, "Internal server error");
});

test("loginSuccess defaults to status 201", () => {
  assert.equal(loginSuccess("msg", {}, "tok", []).statusCode, 201);
});

test("loginSuccess statusCode is overridable for endpoints that return 200", () => {
  assert.equal(loginSuccess("msg", {}, "tok", [], 200).statusCode, 200);
});

test("loginSuccess body contains success, message, userInfo, and token", () => {
  const userInfo = { id: "1", role: "user" };
  const r = loginSuccess("Customer Login successfully", userInfo, "mytoken", [
    "cookie-str",
  ]);
  assert.equal(r.body.success, true);
  assert.equal(r.body.message, "Customer Login successfully");
  assert.deepEqual(r.body.userInfo, userInfo);
  assert.equal(r.body.token, "mytoken");
  assert.deepEqual(r.cookies, ["cookie-str"]);
});

test("error message strings are preserved exactly, not normalized", () => {
  // different endpoints deliberately use different messages — the factory must not alter them
  assert.equal(notFound("Seller not found").body.error, "Seller not found");
  assert.equal(notFound("Customer not found").body.error, "Customer not found");
  assert.equal(
    unauthorized("Invalid credentials").body.error,
    "Invalid credentials",
  );
  assert.equal(unauthorized("Invalid password").body.error, "Invalid password");
});
