// Same-origin gateway: only login, session and logout are available to Swarm.
// The original worker, account configuration and save/profile endpoints are untouched.
const BLOCKED = ['/AGENTS.md', '/AI_HANDOVER.md', '/COLLAB.md', '/PROGRESS.md', '/__sync_kv'];
const SWARM_ORIGIN = 'https://swarm.cianasa888.cfd';
const AUTH_ORIGIN = 'https://game.cianasa888.cfd';
const PREFIX = '/api/swarm/auth/';
const SWARM_COOKIE = '__Host-swarm-session';
const AUTH_COOKIE = '__Host-trash-session';
const FLAGS = 'Path=/; Secure; HttpOnly; SameSite=Strict';

function json(status, data, headers = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}

async function gateway(req, env) {
  const url = new URL(req.url);
  if (url.origin !== SWARM_ORIGIN) return json(403, { error: 'forbidden' });
  const action = url.pathname.slice(PREFIX.length);
  const method = { session: 'GET', login: 'POST', logout: 'POST' }[action];
  if (!Object.hasOwn({ session: 1, login: 1, logout: 1 }, action)) return json(404, { error: 'not_found' });
  if (req.method !== method) return json(405, { error: 'method' });
  if (!env.ACCOUNT_AUTH) return json(503, { error: 'unavailable' });
  if (req.headers.get('Sec-Fetch-Site') === 'cross-site') return json(403, { error: 'forbidden' });
  const headers = new Headers({ 'Accept': 'application/json' });
  const token = req.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-swarm-session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (token) headers.set('Cookie', `${AUTH_COOKIE}=${token}`);
  let body;
  if (method === 'POST') {
    if (req.headers.get('Origin') !== SWARM_ORIGIN) return json(403, { error: 'forbidden' });
    if (!req.headers.get('Content-Type')?.startsWith('application/json')) return json(415, { error: 'body' });
    if (Number(req.headers.get('Content-Length')) > 4096) return json(413, { error: 'body' });
    // Bound the body even when Content-Length is absent.
    const reader = req.body?.getReader();
    const chunks = []; let bytes = 0;
    if (reader) {
      for (;;) { const { value, done } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 4096) { await reader.cancel(); return json(413, { error: 'body' }); } chunks.push(value); }
    }
    const data = new Uint8Array(bytes); let offset = 0;
    for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
    try {
      const input = JSON.parse(new TextDecoder().decode(data));
      if (action === 'login') {
        if (typeof input.email !== 'string' || typeof input.password !== 'string' || input.email.length > 254 || input.password.length > 256) return json(400, { error: 'invalid_credentials' });
        body = JSON.stringify({ email: input.email, password: input.password });
      } else body = '{}';
    } catch { return json(400, { error: 'body' }); }
    headers.set('Content-Type', 'application/json');
    headers.set('Origin', AUTH_ORIGIN);
    const ip = req.headers.get('CF-Connecting-IP');
    if (!ip) return json(403, { error: 'forbidden' });
    headers.set('CF-Connecting-IP', ip);
  }
  // Trusted service-to-service request. Never forward arbitrary paths or browser headers.
  const upstream = await env.ACCOUNT_AUTH.fetch(new Request(`${AUTH_ORIGIN}/api/auth/email/${action}`, { method, headers, body, redirect: 'manual' }));
  const result = await upstream.json();
  const out = {};
  if (action === 'logout' && upstream.ok) out['Set-Cookie'] = `${SWARM_COOKIE}=; ${FLAGS}; Max-Age=0`;
  if (action === 'login' && upstream.ok) {
    const cookie = upstream.headers.get('Set-Cookie') || '';
    const match = cookie.match(/^__Host-trash-session=([a-f0-9]{64});/);
    const age = cookie.match(/(?:^|;\s*)Max-Age=(\d+)/i)?.[1];
    if (!match || !age || typeof result.accountId !== 'string') return json(502, { error: 'unavailable' });
    out['Set-Cookie'] = `${SWARM_COOKIE}=${match[1]}; ${FLAGS}; Max-Age=${age}`;
  }
  // Deliberately expose no original profile, save data, or upstream cookie.
  const payload = upstream.ok ? action === 'logout' ? { ok: true } : { accountId: typeof result.accountId === 'string' ? result.accountId : null } : { error: typeof result.error === 'string' ? result.error : 'unavailable' };
  return json(upstream.status, payload, out);
}

export default {
  async fetch(request, env) {
    const p = new URL(request.url).pathname;
    if (BLOCKED.includes(p) || p.startsWith('/handover/')) return new Response('Gone', { status: 410 });
    if (p.startsWith(PREFIX)) {
      try { return await gateway(request, env); }
      catch { return json(503, { error: 'unavailable' }); }
    }
    return env.ASSETS.fetch(request);
  },
};
