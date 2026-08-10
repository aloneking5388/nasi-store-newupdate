'use strict';

const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function buildSetTokenCookie(token) {
  const expires = new Date(Date.now() + MAX_AGE_SECONDS * 1000).toUTCString();
  const parts = [
    `token=${token}`,
    'HttpOnly',
    `Max-Age=${MAX_AGE_SECONDS}`,
    `Expires=${expires}`,
    'Path=/',
    'SameSite=Strict',
  ];
  if (process.env.NODE_ENV === 'production') {
    parts.splice(2, 0, 'Secure');
  }
  return parts.join('; ');
}

function buildClearTokenCookie() {
  return 'token=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/';
}

module.exports = { buildSetTokenCookie, buildClearTokenCookie };
