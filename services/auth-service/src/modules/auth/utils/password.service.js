'use strict';

const bcrypt = require('bcryptjs');

async function verifyPassword(plain, hashed) {
  if (plain == null || plain === '') return false;
  return bcrypt.compare(plain, hashed);
}

module.exports = { verifyPassword };
