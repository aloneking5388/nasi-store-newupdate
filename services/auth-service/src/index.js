'use strict';

const http = require('http');
const { customerLoginController } = require('./modules/auth/controllers/customer-login.controller');
const { customerRegisterController } = require('./modules/auth/controllers/customer-register.controller');
const { logoutController } = require('./modules/auth/controllers/logout.controller');

const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '4001', 10);
const upstreamBase = (
	process.env.AUTH_UPSTREAM || 'http://localhost:3000/api'
).replace(/\/$/, '');
const upstreamUrl = new URL(upstreamBase);

function normalizeAuthPath(pathname) {
	if (pathname.startsWith('/api/auth/')) {
		return pathname;
	}

	if (pathname.startsWith('/auth/')) {
		return `/api${pathname}`;
	}

	return pathname;
}

function buildUpstreamUrl(pathname, search) {
	const upstreamPath = normalizeAuthPath(pathname);
	const basePath = upstreamUrl.pathname === '/' ? '' : upstreamUrl.pathname.replace(/\/$/, '');
	const combinedPath =
		basePath.endsWith('/api') && upstreamPath.startsWith('/api/')
			? `${basePath}${upstreamPath.slice(4)}`
			: `${basePath}${upstreamPath}`;

	return `${upstreamUrl.origin}${combinedPath}${search}`;
}

function readJsonBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];

		req.on('data', (chunk) => {
			chunks.push(chunk);
		});

		req.on('end', () => {
			if (chunks.length === 0) {
				resolve(null);
				return;
			}

			const raw = Buffer.concat(chunks).toString('utf8');
			resolve(raw);
		});

		req.on('error', reject);
	});
}

function writeJson(res, statusCode, payload) {
	const body = JSON.stringify(payload);
	res.writeHead(statusCode, {
		'Content-Type': 'application/json',
		'Content-Length': Buffer.byteLength(body),
	});
	res.end(body);
}

function getProxyHeaders(req, body) {
	const headers = {
		accept: 'application/json',
		'x-auth-service-proxy': '1',
	};

	if (req.headers['content-type']) {
		headers['content-type'] = req.headers['content-type'];
	}

	if (req.headers.authorization) {
		headers.authorization = req.headers.authorization;
	}

	if (req.headers.cookie) {
		headers.cookie = req.headers.cookie;
	}

	if (body) {
		headers['content-length'] = Buffer.byteLength(body).toString();
	}

	return headers;
}

async function proxyAuthRequest(req, res, parsedUrl) {
	const body = await readJsonBody(req);
	const targetUrl = buildUpstreamUrl(parsedUrl.pathname, parsedUrl.search);

	const upstreamResponse = await fetch(targetUrl, {
		method: req.method,
		headers: getProxyHeaders(req, body),
		body: body,
	});

	const responseBody = await upstreamResponse.text();
	const responseHeaders = {
		'Content-Type':
			upstreamResponse.headers.get('content-type') || 'application/json',
	};

	if (typeof upstreamResponse.headers.getSetCookie === 'function') {
		const cookies = upstreamResponse.headers.getSetCookie();
		if (cookies.length > 0) {
			responseHeaders['Set-Cookie'] = cookies;
		}
	} else {
		const cookieHeader = upstreamResponse.headers.get('set-cookie');
		if (cookieHeader) {
			responseHeaders['Set-Cookie'] = cookieHeader;
		}
	}

	res.writeHead(upstreamResponse.status, responseHeaders);
	res.end(responseBody);
}

const server = http.createServer(async (req, res) => {
	const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

	if (req.method === 'GET' && parsedUrl.pathname === '/health') {
		writeJson(res, 200, {
			service: 'auth-service',
			status: 'ok',
			upstreamBase,
		});
		return;
	}

	if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/customer/login') {
		try {
			await customerLoginController(req, res);
		} catch (error) {
			writeJson(res, 500, {
				service: 'auth-service',
				error: 'Customer login handling failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			});
		}
		return;
	}

	if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/customer/register') {
		try {
			await customerRegisterController(req, res);
		} catch (error) {
			writeJson(res, 500, {
				service: 'auth-service',
				error: 'Customer register handling failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			});
		}
		return;
	}

	if (req.method === 'GET' && parsedUrl.pathname === '/api/auth/logout') {
		try {
			logoutController(req, res, parsedUrl);
		} catch (error) {
			writeJson(res, 500, {
				service: 'auth-service',
				error: 'Logout handling failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			});
		}
		return;
	}

	if (
		parsedUrl.pathname.startsWith('/auth/') ||
		parsedUrl.pathname.startsWith('/api/auth/')
	) {
		try {
			await proxyAuthRequest(req, res, parsedUrl);
		} catch (error) {
			writeJson(res, 502, {
				service: 'auth-service',
				error: 'Auth upstream request failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			});
		}
		return;
	}

	writeJson(res, 404, {
		service: 'auth-service',
		error: 'Route not found',
	});
});

server.listen(port, host, () => {
	console.log(`auth-service listening on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
	console.log(`auth-service proxying auth routes to ${upstreamBase}`);
});
