// MCP server: run with `node --experimental-strip-types tests/mcp.mjs`. No network: content is served from fixtures.
import assert from 'node:assert/strict';
const { handle, resetCache, LIMIT, clientOf } = await import('../api/_lib/mcp.ts');

const pages = [
  { path: '/', title: 'Home', about: 'Life design through experimentation.' },
  { path: '/how-it-works', title: 'How it works', about: 'Three values, one loop, no assigned tasks.' },
];
const index = { notes: [
  { title: 'Tsundoku', slug: 'tsundoku', week: 26, date: '2026-10-09T00:00:00.000Z', summary: 'Piles of unread books.' },
  { title: 'First draft of our values', slug: 'first-draft-of-our-values', week: 8, date: '2026-06-11T00:00:00.000Z', summary: 'Curiosity, agency and compassion.' },
] };
const files = {
  '/lab-notes/notes.json': JSON.stringify(index),
  '/index.md': '<!-- Home | x -->\n\n# Home\n\nLab Night every Thursday.',
  '/how-it-works.md': '# How it works\n\nWe operate like an artist studio.',
  '/lab-notes/tsundoku.md': '<!-- Tsundoku | x -->\n\n# Tsundoku\n\nThe founder opened from Abu Dhabi, in a bookstore.',
  '/lab-notes/first-draft-of-our-values.md': '# First draft of our values\n\nWe wrote the values down.',
};
const fetched = [];
const fakeFetch = async (url) => { const p = new URL(url).pathname; fetched.push(p); return p in files ? new Response(files[p]) : new Response('no', { status: 404 }); };
const logs = [];
let now = 1_000_000;
const opts = { pages, contentOrigin: 'http://content.test', fetch: fakeFetch, log: (l) => logs.push(l), now: () => now };

let id = 0;
const rpc = async (method, params, ip = '10.0.0.1') => {
  const res = await handle(new Request('http://x.test/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'x-forwarded-for': ip }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) }), opts);
  return { status: res.status, headers: res.headers, body: res.status === 200 ? await res.json() : await res.text() };
};
const call = async (name, args) => (await rpc('tools/call', { name, arguments: args })).body.result.content[0].text;

// initialize and tools/list
const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test-agent', version: '1.2.3', title: 'Test Agent' } });
assert.equal(init.status, 200);
assert.equal(init.body.result.serverInfo.name, 'ikigai-collective');
assert.ok(init.body.result.instructions.includes('read-only'));
assert.equal(init.headers.get('mcp-session-id'), null, 'stateless: no session');
assert.equal(init.headers.get('access-control-allow-origin'), '*');
const tools = (await rpc('tools/list', {})).body.result.tools;
assert.deepEqual(tools.map((t) => t.name).sort(), ['search', 'show_page']);
assert.ok(tools.every((t) => t.annotations.readOnlyHint === true));

// search: notes and pages, links to the canonical site, body text searched
let t = await call('search', { query: 'values' });
assert.ok(t.startsWith('1 result') || t.includes('First draft of our values'));
assert.ok(t.includes('https://ikigaicollective.org/lab-notes/first-draft-of-our-values'));
t = await call('search', { query: 'artist studio' });
assert.ok(t.includes('https://ikigaicollective.org/how-it-works'), 'page body is searchable');
t = await call('search', { query: 'Abu Dhabi bookstore' });
assert.ok(t.includes('Tsundoku') && t.includes('Abu Dhabi'), 'snippet from the body');
t = await call('search', { query: 'xyzzy nothing' });
assert.ok(t.startsWith('Nothing on ikigaicollective.org matches') && t.includes('/lab-notes'), 'graceful empty search');

// show_page: slug, path, URL, .md; markdown twin with source link; header comment stripped
for (const p of ['tsundoku', '/lab-notes/tsundoku', 'https://ikigaicollective.org/lab-notes/tsundoku', 'https://ikigaicollective.org/lab-notes/tsundoku.md']) {
  t = await call('show_page', { page: p });
  assert.ok(t.startsWith('Source: https://ikigaicollective.org/lab-notes/tsundoku') && t.includes('# Tsundoku') && !t.includes('<!--'), p);
}
t = await call('show_page', { page: '/' });
assert.ok(t.includes('Source: https://ikigaicollective.org/') && t.includes('Lab Night every Thursday'));

// not found: graceful, with suggestions, and nothing outside the allowlist is fetched
const before = fetched.length;
t = await call('show_page', { page: '/lab-notes/first-draft-values-v2' });
assert.ok(t.startsWith('Not found') && t.includes('first-draft-of-our-values'), 'suggests near matches');
t = await call('show_page', { page: 'https://evil.test/../../etc/passwd' });
assert.ok(t.startsWith('Not found'));
for (const p of ['https://example.com', 'http://evil.com/lab-notes/tsundoku', 'https://ikigaicollective.org.evil.com/', 'https://ikigaicollective.org@evil.com/', 'https://x@ikigaicollective.org/', '//evil.com', '//evil.com/lab-notes/tsundoku', 'ftp://ikigaicollective.org/', 'javascript:alert(1)', 'example.com', 'https:\\\\evil.com']) {
  t = await call('show_page', { page: p });
  assert.ok(t.startsWith('Not found'), 'refused: ' + p);
}
for (const p of ['https://www.ikigaicollective.org/lab-notes/tsundoku', 'http://content.test/lab-notes/tsundoku', 'HTTPS://IKIGAICOLLECTIVE.ORG/']) {
  t = await call('show_page', { page: p });
  assert.ok(t.startsWith('Source: https://ikigaicollective.org/'), 'own host accepted: ' + p);
}
assert.equal(fetched.length, before, 'cached and allowlisted: no new fetches');

// content cached per instance, refreshed after 5 minutes
now += 6 * 60_000;
await call('search', { query: 'values' });
assert.ok(fetched.length > before, 'cache expired: refetched');

// content source down: short answer plus link, not an error
resetCache();
const down = { ...opts, fetch: async () => new Response('', { status: 503 }) };
const r = await handle(new Request('http://x.test/mcp', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/call', params: { name: 'search', arguments: { query: 'values' } } }) }), down);
assert.ok((await r.json()).result.content[0].text.includes('https://ikigaicollective.org/lab-notes'));

// logging: initialize logs the client app's name and version only; tool calls log the tool name and query only
const parsed = logs.map((l) => JSON.parse(l));
const inits = parsed.filter((l) => l.mcp === 'initialize');
assert.deepEqual(inits, [{ mcp: 'initialize', client: { name: 'test-agent', version: '1.2.3' } }], 'one initialize line, name and version only');
const toolLines = parsed.filter((l) => l.mcp !== 'initialize');
assert.ok(toolLines.length > 0 && toolLines.every((l) => Object.keys(l).join() === 'mcp,query'));
assert.ok(!logs.some((l) => l.includes('10.0.0.1')), 'no IPs in logs');
// clientInfo is trimmed to short plain strings; missing or malformed clientInfo logs nothing
assert.deepEqual(clientOf({ name: 'cursor', version: '2.0', title: 'x', websiteUrl: 'https://x', icons: [] }), { name: 'cursor', version: '2.0' });
assert.deepEqual(clientOf({ name: 'a\nb'.padEnd(300, 'z') }), { name: 'ab'.padEnd(100, 'z') });
assert.equal(clientOf({ name: '' }), undefined);
assert.equal(clientOf({ name: 42 }), undefined);
assert.equal(clientOf(undefined), undefined);
const nInit = logs.length;
await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {} });
assert.equal(logs.length, nInit, 'invalid initialize (no clientInfo): not logged');

// HTTP edges: GET/DELETE 405, OPTIONS preflight, bad JSON, rate limit
assert.equal((await handle(new Request('http://x.test/mcp'), opts)).status, 405);
assert.equal((await handle(new Request('http://x.test/mcp', { method: 'DELETE' }), opts)).status, 405);
assert.equal((await handle(new Request('http://x.test/mcp', { method: 'OPTIONS' }), opts)).status, 204);
assert.equal((await handle(new Request('http://x.test/mcp', { method: 'POST', body: '{nope' }), opts)).status, 400);
now += 120_000;
let last;
for (let i = 0; i <= LIMIT; i++) last = await rpc('tools/list', {}, '10.9.9.9');
assert.equal(last.status, 429, 'over the limit');
assert.equal((await rpc('tools/list', {}, '10.8.8.8')).status, 200, 'other clients unaffected');
now += 61_000;
assert.equal((await rpc('tools/list', {}, '10.9.9.9')).status, 200, 'window resets');

console.log('mcp: all checks passed');
