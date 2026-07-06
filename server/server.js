'use strict';
/*
 * Minimal read-only demo server.
 *  - Serves the Command Center static app (../command-center).
 *  - Exposes two read-only JSON endpoints backed by the bol.com connector:
 *      GET /api/bol/status   (config only — never calls bol.com)
 *      GET /api/bol/summary  (read-only pull; mock unless BOL_LIVE=true)
 *  - Refuses any non-GET method so the server cannot mutate anything.
 *
 * No framework / no dependencies — uses Node's built-in http + global fetch.
 * Run:  node --env-file=.env server/server.js   (or plain `node server/server.js` for mock mode)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const bol = require('./bol-client');

const PORT = process.env.PORT || 8137;
const STATIC_DIR = path.join(__dirname, '..', 'command-center');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.png': 'image/png',
};

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  // Read-only server: refuse everything except GET.
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Read-only demo server — only GET is allowed.' });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  if (p === '/api/bol/status') {
    return sendJson(res, 200, bol.status());
  }
  if (p === '/api/bol/summary') {
    try {
      return sendJson(res, 200, await bol.getSummary());
    } catch (e) {
      return sendJson(res, 502, { mode: 'error', error: String((e && e.message) || e) });
    }
  }

  // Static files (path-traversal guarded).
  let file = p === '/' ? '/index.html' : decodeURIComponent(p);
  const full = path.normalize(path.join(STATIC_DIR, file));
  if (!full.startsWith(STATIC_DIR)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const s = bol.status();
  console.log(`Command Center → http://localhost:${PORT}`);
  console.log(`bol.com connector: ${s.mode.toUpperCase()} mode (read-only). ${s.note}`);
});
