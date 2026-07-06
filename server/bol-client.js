'use strict';
/*
 * bol.com Retailer API client — READ-ONLY.
 *
 * Safety model:
 *  - Runs in MOCK mode unless credentials are provided AND BOL_LIVE === 'true'.
 *  - Only ever issues GET requests to bol.com. There is deliberately no code
 *    path here that POSTs/PUTs/DELETEs against the retailer account.
 *  - The client secret is read from the environment and never logged or
 *    returned to the browser.
 *
 * Docs: https://api.bol.com/retailer/public/Retailer-API/v10/
 */

const mock = require('./mock-data');

const CLIENT_ID     = process.env.BOL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.BOL_CLIENT_SECRET || '';
const LIVE          = process.env.BOL_LIVE === 'true';
const TOKEN_URL     = process.env.BOL_TOKEN_URL || 'https://login.bol.com/token?grant_type=client_credentials';
const API_BASE      = (process.env.BOL_API_BASE || 'https://api.bol.com/retailer').replace(/\/+$/, '');
const API_VERSION   = process.env.BOL_API_VERSION || 'v10';

function configured() { return Boolean(CLIENT_ID && CLIENT_SECRET); }
function isLive()     { return LIVE && configured(); }

function status() {
  return {
    mode: isLive() ? 'live' : 'mock',
    configured: configured(),
    live: isLive(),
    readOnly: true,
    apiBase: isLive() ? API_BASE : null,
    apiVersion: API_VERSION,
    note: isLive()
      ? 'Connected to the bol.com Retailer API in read-only mode.'
      : configured()
        ? 'Credentials found, but BOL_LIVE is not "true" — serving mock data. Set BOL_LIVE=true to enable read-only live calls.'
        : 'No bol.com credentials configured — serving mock data.',
  };
}

/* ---- OAuth2 client-credentials (token cached until ~5s before expiry) ---- */
let token = null; // { value, exp }

async function getToken() {
  if (token && token.exp > Date.now() + 5000) return token.value;
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`bol.com auth failed (HTTP ${res.status})`);
  const j = await res.json();
  token = { value: j.access_token, exp: Date.now() + ((j.expires_in || 290) * 1000) };
  return token.value;
}

/* ---- Read-only GET helper. This module issues GET and nothing else. ---- */
async function apiGet(pathname) {
  const t = await getToken();
  const res = await fetch(`${API_BASE}${pathname}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: `application/vnd.retailer.${API_VERSION}+json`,
    },
  });
  if (res.status === 429) throw new Error('bol.com rate limit hit (HTTP 429) — try again shortly');
  if (!res.ok) throw new Error(`bol.com GET ${pathname} -> HTTP ${res.status}`);
  return res.json();
}

/* Summarise open orders + open returns into a few command-center metrics. */
async function getSummary() {
  if (!isLive()) {
    return { ...mock.summary, mode: 'mock', note: status().note };
  }

  // Surface authentication problems clearly rather than masking them as "0 orders".
  await getToken();

  const [orders, returns] = await Promise.all([
    apiGet('/orders?status=OPEN').catch(() => ({ orders: [] })),
    apiGet('/returns?handled=false').catch(() => ({ returns: [] })),
  ]);

  const list = orders.orders || [];
  let value = 0, items = 0;
  for (const o of list) {
    for (const it of (o.orderItems || [])) {
      const q = it.quantity != null ? it.quantity : 1;
      const price = it.unitPrice != null ? it.unitPrice : (it.price != null ? it.price : 0);
      value += price * q;
      items += q;
    }
  }

  return {
    mode: 'live',
    currency: 'EUR',
    openOrders: list.length,
    openOrderItems: items,
    openOrderValue: Math.round(value * 100) / 100,
    openReturns: (returns.returns || []).length,
    note: 'Live read-only pull from the bol.com Retailer API.',
  };
}

module.exports = { status, getSummary };
