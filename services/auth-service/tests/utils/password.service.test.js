'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { verifyPassword } = require('../../src/modules/auth/utils/password.service');

test('verifyPassword returns true for the correct password', async () => {
  const hash = await bcrypt.hash('correct', 10);
  assert.equal(await verifyPassword('correct', hash), true);
});

test('verifyPassword returns false for an incorrect password', async () => {
  const hash = await bcrypt.hash('correct', 10);
  assert.equal(await verifyPassword('wrong', hash), false);
});

test('verifyPassword returns false when plain is null', async () => {
  const hash = await bcrypt.hash('correct', 10);
  assert.equal(await verifyPassword(null, hash), false);
});

test('verifyPassword returns false when plain is undefined', async () => {
  const hash = await bcrypt.hash('correct', 10);
  assert.equal(await verifyPassword(undefined, hash), false);
});

test('verifyPassword returns false for an empty string password', async () => {
  const hash = await bcrypt.hash('correct', 10);
  assert.equal(await verifyPassword('', hash), false);
});
