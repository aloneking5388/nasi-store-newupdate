"use strict";

const mongoose = require("mongoose");
const { verifyPassword } = require("../utils/password.service");
const { signToken } = require("../utils/jwt.service");
const { buildSetTokenCookie } = require("../utils/cookie.service");
const {
  loginSuccess,
  notFound,
  unauthorized,
  serverError,
} = require("../utils/response.factory");
const { buildCustomerUserInfo } = require("../utils/user.mapper");

let connectionPromise = null;

async function connectDatabase() {
  if (mongoose.connection.readyState) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then(() => mongoose.connection)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

function resolveCustomerType(customer) {
  if (customer?.customerType === "normal") return "normal";
  if (customer?.customerType === "subscription") return "subscription";

  if (
    customer?.referredBy ||
    (customer?.invested ?? 0) > 0 ||
    (customer?.referralCount ?? 0) > 0 ||
    (customer?.earnings ?? 0) > 0
  ) {
    return "subscription";
  }

  return "normal";
}

async function loginCustomer(credentials) {
  try {
    await connectDatabase();

    const { email, password } = credentials ?? {};
    const users = mongoose.connection.db.collection("users");
    const customer = await users.findOne({ email });

    if (!customer) return notFound("Customer not found");

    const valid = await verifyPassword(password, customer.password);
    if (!valid) return unauthorized("Invalid credentials");

    const customerType = resolveCustomerType(customer);
    const token = signToken({
      id: customer._id,
      role: customer.role,
      name: customer.name,
      email: customer.email,
      status: customer.status,
      customerType,
    });

    return loginSuccess(
      "Customer Login successfully",
      buildCustomerUserInfo(customer, customerType),
      token,
      [buildSetTokenCookie(token)],
    );
  } catch {
    return serverError();
  }
}

module.exports = { loginCustomer, resolveCustomerType };
