import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';

const origin = 'https://swarm.cianasa888.cfd';
const token = 'a'.repeat(64);
let calls = [];
const env = {
  ASSETS: { fetch: () => new Response('asset') },
  ACCOUNT_AUTH: { async fetch(req) {
    const action = new URL(req.url).pathname.split('/').pop();
    calls.push({ action, origin: req.headers.get('Origin'), cookie: req.headers.get('Cookie'), ip: req.headers.get('CF-Connecting-IP') });
    assert.equal(new URL(req.url).origin, 'https://game.cianasa888.cfd');
    if (action === 'login') {
      const body = await req.json();
      if (body.password !== 'test-password') return Response.json({ error: 'invalid_credentials' }, { status: 401 });
      return Response.json({ accountId: 'test-account', privateData: 'not passed' }, { headers: {'Set-Cookie': `__Host-trash-session=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=300`} });
    }
    if (action === 'logout') return Response.json({ ok: true });
    return Response.json({ accountId: req.headers.get('Cookie') ? 'test-account' : null });
  } },
};
function request(action, opts = {}) { return new Request(`${origin}/api/swarm/auth/${action}`, opts); }
const post = { method:'POST', headers:{ Origin:origin, 'Content-Type':'application/json', 'CF-Connecting-IP':'192.0.2.1' }, body:JSON.stringify({email:'test@example.com', password:'test-password'}) };
test('login, cookie translation, session and logout', async () => {
  const res = await worker.fetch(request('login', post), env);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {accountId:'test-account'});
  assert.match(res.headers.get('Set-Cookie'), /^__Host-swarm-session=/);
  assert.match(res.headers.get('Set-Cookie'), /HttpOnly; SameSite=Strict/);
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  assert.equal(calls.at(-1).ip, '192.0.2.1');
  const h = { Cookie:`__Host-swarm-session=${token}; other=ignored` };
  const session = await worker.fetch(request('session', {headers:h}), env);
  assert.deepEqual(await session.json(), {accountId:'test-account'});
  assert.equal(calls.at(-1).cookie, `__Host-trash-session=${token}`);
  const logout = await worker.fetch(request('logout', {...post, headers:{...post.headers,...h}, body:'{}'}), env);
  assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
});
test('denies foreign origins, methods, original profile and save routes', async () => {
  const before = calls.length;
  assert.equal((await worker.fetch(request('login',{...post,headers:{...post.headers,Origin:'https://evil.example'}}),env)).status,403);
  assert.equal((await worker.fetch(request('profile'),env)).status,404);
  assert.equal((await worker.fetch(request('save',post),env)).status,404);
  assert.equal((await worker.fetch(request('login'),env)).status,405);
  assert.equal((await worker.fetch(new Request('https://other.example/api/swarm/auth/session'),env)).status,403);
  assert.equal((await worker.fetch(request('login',{...post,body:'x'.repeat(4097)}),env)).status,413);
  assert.equal(calls.length,before);
});
test('invalid password and anonymous session remain unauthenticated', async () => {
  const res = await worker.fetch(request('login',{...post,body:'{"email":"test@example.com","password":"wrong"}'}),env);
  assert.equal(res.status,401); assert.equal(res.headers.get('Set-Cookie'),null);
  assert.deepEqual(await (await worker.fetch(request('session',{headers:{Cookie:`__Host-trash-session=${token}`}}),env)).json(),{accountId:null});
  assert.equal((await worker.fetch(request('session'),{})).status,503);
});
test('preserves static assets and handover blocking',async()=>{
  assert.equal(await (await worker.fetch(new Request(`${origin}/`),env)).text(),'asset');
  assert.equal((await worker.fetch(new Request(`${origin}/handover/README.md`),env)).status,410);
});
