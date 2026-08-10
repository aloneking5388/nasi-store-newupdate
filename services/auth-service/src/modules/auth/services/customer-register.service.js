'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { signToken } = require('../utils/jwt.service');
const { buildSetTokenCookie } = require('../utils/cookie.service');
const { resolveCustomerType } = require('./customer-login.service');

let connectionPromise = null;

function buildDelegateBase() {
  const configured = process.env.AUTH_DELEGATE_BASE || process.env.AUTH_UPSTREAM || 'http://localhost:3000/api';
  const trimmed = configured.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
}

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

function registrationError(statusCode, message) {
  return {
    statusCode,
    body: { success: false, message },
    cookies: [],
  };
}

function registrationSuccess(user, token) {
  const customerType = resolveCustomerType(user);
  return {
    statusCode: 201,
    body: {
      success: true,
      message: 'User registered successfully',
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        customerType,
        referredBy: user.referredBy ?? null,
      },
      token,
    },
    cookies: [buildSetTokenCookie(token)],
  };
}

async function delegateEnrollment(delegateBase, payload) {
  const response = await fetch(`${delegateBase}/api/internal/customer-registration/enroll`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-service-proxy': '1',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Domain enrollment delegation failed');
  }
}

async function delegateRegistrationEmail(delegateBase, payload) {
  const response = await fetch(`${delegateBase}/api/internal/customer-registration/send-email`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-auth-service-proxy': '1',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Registration email delegation failed');
  }
}

async function registerCustomer(input) {
  try {
    await connectDatabase();

    const { name, email, password, referredBy, joiningFee } = input ?? {};

    if (!name || !email || !password) {
      return registrationError(400, 'All fields are required');
    }

    const users = mongoose.connection.db.collection('users');
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return registrationError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = crypto.randomUUID().slice(0, 8);
    const normalizedReferral = typeof referredBy === 'string' ? referredBy.trim() : '';
    const parsedJoiningFee = Number(joiningFee || 0);
    const now = new Date();

    const createResult = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      referralCode,
      referredBy: null,
      invested: 0,
      customerType: 'normal',
      status: 'active',
      role: 'user',
      downline: [],
      uplines: [],
      bonusesGiven: [],
      referralCount: 0,
      earnings: 0,
      level: 0,
      createdAt: now,
      updatedAt: now,
    });

    const userId = createResult.insertedId;
    const delegateBase = buildDelegateBase();

    if (normalizedReferral.length > 0) {
      await delegateEnrollment(delegateBase, {
        userId: String(userId),
        referredBy: normalizedReferral,
        joiningFee: parsedJoiningFee,
      });
    }

    await delegateRegistrationEmail(delegateBase, {
      type: 'registration_success',
      email,
      name,
    });

    const latestUser = await users.findOne({ _id: userId });
    if (!latestUser) {
      throw new Error('Created user not found after registration');
    }

    const token = signToken({
      id: latestUser._id,
      name: latestUser.name,
      email: latestUser.email,
      role: latestUser.role,
      status: latestUser.status,
      customerType: resolveCustomerType(latestUser),
    });

    return registrationSuccess(latestUser, token);
  } catch {
    return registrationError(500, 'Server error');
  }
}

module.exports = {
  registerCustomer,
};
