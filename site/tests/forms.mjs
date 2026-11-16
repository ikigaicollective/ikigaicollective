// Public form checks: run with `node --experimental-strip-types tests/forms.mjs`. No network: fetch is stubbed.
import assert from 'node:assert/strict';
import { register } from 'node:module';
// api/*.ts import siblings as './_lib/x.js' (Vercel's bundler resolves them); map those to .ts for Node.
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(s, c, next) {
  try { return await next(s, c); } catch (e) { if (s.endsWith('.js') && c.parentURL?.includes('/api/')) return next(s.slice(0, -3) + '.ts', c); throw e; }
}`));
const { read } = await import('../api/_lib/form.ts');
const invite = await import('../api/invite.ts');
const partner = await import('../api/partner.ts');

const req = (body, url = 'https://preview.test/api/x') => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const errorOf = async (r) => (r instanceof Response ? { status: r.status, ...(await r.json()) } : r);
let fetchImpl = async () => new Response('{}');
globalThis.fetch = (...a) => fetchImpl(...a);

// read(): bad JSON, non-object JSON, honeypot, trimming
delete process.env.TURNSTILE_SECRET; delete process.env.PUBLIC_SITE_ENV;
assert.deepEqual(await errorOf(await read(req('{not json'), { email: 10 })), { status: 400, error: 'bad-json' });
for (const b of ['null', '"text"', '3', '[1]']) assert.deepEqual(await errorOf(await read(req(b), { email: 10 })), { status: 400, error: 'bad-json' }, `body ${b}`);
assert.deepEqual(await errorOf(await read(req({ website: 'spam' }), { email: 10 })), { status: 200, ok: true });
assert.deepEqual(await read(req({ email: '  a@x.org  ', name: 'x'.repeat(200) }), { email: 254, name: 5 }), { email: 'a@x.org', name: 'xxxxx' });

// Turnstile: missing token, failure, network error -> 400 turnstile, never a throw
process.env.TURNSTILE_SECRET = 's';
assert.deepEqual(await errorOf(await read(req({ email: 'a@x.org' }), { email: 254 })), { status: 400, error: 'turnstile' });
fetchImpl = async () => new Response(JSON.stringify({ success: false }));
assert.deepEqual(await errorOf(await read(req({ email: 'a@x.org', 'cf-turnstile-response': 't' }), { email: 254 })), { status: 400, error: 'turnstile' });
fetchImpl = async () => { throw new TypeError('fetch failed'); };
assert.deepEqual(await errorOf(await read(req({ email: 'a@x.org', 'cf-turnstile-response': 't' }), { email: 254 })), { status: 400, error: 'turnstile' });
fetchImpl = async () => new Response('<html>busy</html>', { status: 503 });
assert.deepEqual(await errorOf(await read(req({ email: 'a@x.org', 'cf-turnstile-response': 't' }), { email: 254 })), { status: 400, error: 'turnstile' });
fetchImpl = async () => new Response(JSON.stringify({ success: true }));
assert.deepEqual(await read(req({ email: 'a@x.org', 'cf-turnstile-response': 't' }), { email: 254 }), { email: 'a@x.org' });
delete process.env.TURNSTILE_SECRET;

// invite POST: 400 on email, 503 when not configured, 502 when the calendar fails
const status = async (r) => [r.status, (await r.json()).error];
assert.deepEqual(await status(await invite.POST(req('null'))), [400, 'bad-json']);
assert.deepEqual(await status(await invite.POST(req({ email: 'nope' }))), [400, 'email']);
assert.deepEqual(await status(await invite.POST(req({ email: 'a@x.org' }))), [503, 'not-configured']);
Object.assign(process.env, { GOOGLE_CLIENT_ID: 'x', GOOGLE_CLIENT_SECRET: 'x', GOOGLE_REFRESH_TOKEN: 'x', SHEET_ID: 's', LAB_NIGHT_EVENT_ID_PREVIEW: 'ev' });
fetchImpl = async (url) => (String(url).includes('oauth2') ? new Response(JSON.stringify({ access_token: 't', expires_in: 3600 })) : new Response('down', { status: 500 }));
assert.deepEqual(await status(await invite.POST(req({ email: 'a@x.org' }))), [502, 'server']);

// partner POST: 400 on missing fields, 502 when the sheet fails
assert.deepEqual(await status(await partner.POST(req({ org: 'Acme', email: 'a@x.org' }))), [400, 'fields']);
assert.deepEqual(await status(await partner.POST(req({ org: 'Acme', email: 'a@x.org', message: 'hi' }))), [502, 'server']);
console.log('forms: all passed');
