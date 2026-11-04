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
console.log('guard: all passed');
