'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-jwt-util';
const { signToken } = require('../../src/modules/auth/utils/jwt.service');

test('signToken preserves all payload fields in decoded token', () => {
  const payload = { id: '123', role: 'user', name: 'Test', email: 't@ex.com', status: 'active', customerType: 'normal' };
  const decoded = jwt.decode(signToken(payload));
  for (const key of Object.keys(payload)) {
    assert.equal(String(decoded[key]), String(payload[key]));
  }
});

test('signToken sets expiry to exactly 7 days', () => {
  const { iat, exp } = jwt.decode(signToken({ id: '1' }));
  assert.equal(exp - iat, 7 * 24 * 60 * 60);
});

test('signToken uses HS256 algorithm', () => {
  const header = JSON.parse(Buffer.from(signToken({ id: '1' }).split('.')[0], 'base64url').toString());
  assert.equal(header.alg, 'HS256');
});

test('signToken is verifiable with the same JWT_SECRET', () => {
  const token = signToken({ id: '1' });
  assert.doesNotThrow(() => jwt.verify(token, 'test-secret-jwt-util'));
});

test('signToken fails verification with a different secret', () => {
  const token = signToken({ id: '1' });
  assert.throws(() => jwt.verify(token, 'wrong-secret'));
});
