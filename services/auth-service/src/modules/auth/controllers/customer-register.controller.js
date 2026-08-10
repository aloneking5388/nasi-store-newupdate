'use strict';

const { registerCustomer } = require('../services/customer-register.service');

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

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve('');
        return;
      }

      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });
}

async function customerRegisterController(req, res) {
  try {
    const rawBody = await readRequestBody(req);
    const parsedBody = rawBody ? JSON.parse(rawBody) : {};
    const result = await registerCustomer(parsedBody);
    sendJson(res, result.statusCode, result.body, result.cookies);
  } catch {
    sendJson(res, 500, { success: false, message: 'Server error' }, []);
  }
}

module.exports = {
  customerRegisterController,
};
