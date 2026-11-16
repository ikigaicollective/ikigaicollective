// Lab Night calendar guard: run with `node --experimental-strip-types tests/guard.mjs`.
import assert from 'node:assert/strict';
Object.assign(process.env, { GOOGLE_CLIENT_ID: 'x', GOOGLE_CLIENT_SECRET: 'x', GOOGLE_REFRESH_TOKEN: 'x', LAB_NIGHT_EVENT_ID_PREVIEW: 'ev', SHEET_ID: 's', PUBLIC_MEET_URL: 'https://meet.google.com/yxb-oakp-fov' });
const { addGuest } = await import('../api/_lib/google.ts');

const good = { id: 'ev', guestsCanSeeOtherGuests: false, location: 'https://meet.google.com/yxb-oakp-fov', description: 'Join: https://meet.google.com/yxb-oakp-fov', attendees: [{ email: 'a@x.org' }] };
let live = false;
const run = async (get, patched) => {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url), m = init.method ?? 'GET';
    calls.push(`${m} ${u.includes('oauth2') ? 'token' : u.includes('sheets') ? `sheet ${decodeURIComponent(u).match(/values\/([^!]+)/)?.[1]}` : 'event'}${init.body && m === 'PATCH' ? ' ' + Object.keys(JSON.parse(init.body)).join(',') : ''}`);
    const body = u.includes('oauth2') ? { access_token: 't', expires_in: 3600 } : u.includes('sheets') ? {} : m === 'PATCH' ? patched : get;
    return new Response(JSON.stringify(body), { status: 200 });
  };
  const res = await addGuest('new@x.org', live).then((r) => r, (e) => e);
  return { res, calls };
};

let r = await run(good, { ...good, attendees: [...good.attendees, { email: 'new@x.org' }] });
assert.equal(r.res.added, true);
assert.ok(r.calls.includes('PATCH event attendees'), 'patches attendees only');

r = await run({ ...good, location: 'Discord', description: 'no link' }, good);
assert.ok(r.res instanceof Error && !r.calls.some((c) => c.startsWith('PATCH event')), 'no Meet link before: no patch');
assert.ok(r.calls.includes('POST sheet Alerts-test'), 'alert row written');

r = await run(good, { ...good, guestsCanSeeOtherGuests: true });
assert.ok(r.res instanceof Error && r.calls.filter((c) => c.startsWith('PATCH event')).length === 2, 'changed after patch: rolled back');
assert.ok(r.calls.includes('POST sheet Alerts-test'));

r = await run(good, { ...good, location: 'https://meet.google.com/zzz-zzzz-zzz' });
assert.ok(r.res instanceof Error && r.calls.filter((c) => c.startsWith('PATCH event')).length === 2, 'link changed after patch: rolled back');

r = await run(good, { ...good, conferenceData: { x: 1 } });
assert.ok(r.res instanceof Error, 'conferenceData appeared: rolled back');

live = true; process.env.LAB_NIGHT_EVENT_ID = 'ev'; process.env.PUBLIC_MEET_URL = 'https://meet.google.com/other-link';
r = await run(good, good);
assert.ok(r.res instanceof Error && !r.calls.some((c) => c.startsWith('PATCH event')), 'production: link must equal PUBLIC_MEET_URL');
live = false;

r = await run({ ...good, attendees: [{ email: 'NEW@x.org' }] }, good);
assert.equal(r.res.added, false);

// Concurrent sign-ups: the PATCH carries If-Match with the event etag; on 412 it re-reads and keeps the other guest.
{
  let version = 1, list = [...good.attendees];
  const patches = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url), m = init.method ?? 'GET';
    if (u.includes('oauth2')) return new Response(JSON.stringify({ access_token: 't', expires_in: 3600 }));
    if (u.includes('sheets')) return new Response('{}');
    if (m === 'GET') return new Response(JSON.stringify({ ...good, etag: `"v${version}"`, attendees: list }));
    patches.push({ ifMatch: new Headers(init.headers).get('if-match'), attendees: JSON.parse(init.body).attendees.map((a) => a.email) });
    if (patches.length === 1) { list = [...list, { email: 'other@x.org' }]; version += 1; } // another sign-up lands between our GET and PATCH
    if (new Headers(init.headers).get('if-match') !== `"v${version}"`) return new Response('{"error":"conditionNotMet"}', { status: 412 });
    list = JSON.parse(init.body).attendees; version += 1;
    return new Response(JSON.stringify({ ...good, etag: `"v${version}"`, attendees: list }));
  };
  const res = await addGuest('new@x.org', false);
  assert.equal(res.added, true);
  assert.deepEqual(patches.map((p) => p.ifMatch), ['"v1"', '"v2"'], 'PATCH sends If-Match and retries after 412');
  assert.deepEqual(list.map((a) => a.email), ['a@x.org', 'other@x.org', 'new@x.org'], 'no guest lost');
}
console.log('guard: all passed');
