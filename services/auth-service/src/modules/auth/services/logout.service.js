"use strict";

const { buildClearTokenCookie } = require("../utils/cookie.service");

function formatLogoutMessage(role) {
  const normalized =
    typeof role === "string" && role.trim().length > 0 ? role.trim() : "User";
  return `${normalized.charAt(0).toUpperCase() + normalized.slice(1)} logout successful!`;
}

function createLogoutPayload(role) {
  return {
    statusCode: 200,
    body: { success: true, message: formatLogoutMessage(role) },
    cookies: [buildClearTokenCookie()],
  };
}

module.exports = { createLogoutPayload };
