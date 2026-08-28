"use strict";

// statusCode defaults to 201 matching the current auth login contract
function loginSuccess(message, userInfo, token, cookies, statusCode = 201) {
  return {
    statusCode,
    body: { success: true, message, userInfo, token },
    cookies,
  };
}

function notFound(message) {
  return { statusCode: 404, body: { error: message }, cookies: [] };
}

function unauthorized(message) {
  return { statusCode: 401, body: { error: message }, cookies: [] };
}

function serverError() {
  return {
    statusCode: 500,
    body: { error: "Internal server error" },
    cookies: [],
  };
}

module.exports = { loginSuccess, notFound, unauthorized, serverError };
