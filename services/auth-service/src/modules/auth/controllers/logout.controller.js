'use strict';

const { createLogoutPayload } = require('../services/logout.service');

function sendJson(res, statusCode, payload, cookies) {
  const body = JSON.stringify(payload);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  };

  if (cookies && cookies.length > 0) {
    headers['Set-Cookie'] = cookies;
  }

  res.writeHead(statusCode, headers);
  res.end(body);
}

function logoutController(req, res, parsedUrl) {
  const role = parsedUrl.searchParams.get('role') || 'User';
  const payload = createLogoutPayload(role);
  sendJson(res, payload.statusCode, payload.body, payload.cookies);
}

module.exports = {
  logoutController,
};
