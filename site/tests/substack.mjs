// Substack import: run with `node --experimental-strip-types tests/substack.mjs`. No network: fetch is stubbed.
import assert from 'node:assert/strict';
Object.assign(process.env, { CRON_SECRET: 'sekret', GITHUB_CONTENT_TOKEN: 'tok', GITHUB_REPO: 'org/repo', GITHUB_BRANCH: 'site-v2', SUBSTACK_FEED_URL: 'https://feed.test/feed' });
const { facts, plan } = await import('../api/_lib/substack.js');
const { GET } = await import('../api/cron/substack.ts');

const item = (slug, pubDate) => ({ title: slug, link: `https://ikigaicollective.substack.com/p/${slug}`, pubDate, 'content:encoded': `<p>Body of ${slug}.</p>` });
const note = (slug, date, week, canonical) => `---\ntitle: "${slug}"\ndate: ${date}\nweek: ${week}\nslug: "${slug}"\n${canonical ? `canonical: "${canonical}"\n` : ''}source: substack\n---\n\nBody.\n`;

// facts(): frontmatter -> slug, canonical, date, week
const [f] = facts([note('a', '2026-10-01', 25, 'https://ikigaicollective.substack.com/p/a')]);
assert.equal(f.slug, 'a');
assert.equal(f.canonical, 'https://ikigaicollective.substack.com/p/a');
assert.equal(f.week, 25);
assert.equal(f.t, +new Date('2026-10-01'));

// plan(): skips known slug and known canonical; imports a distinct post even within 2 days of another note; numbers new weeks from the max
const existing = facts([
  note('known-slug', '2026-09-01', 20),
  note('other', '2026-09-08', 21, 'https://ikigaicollective.substack.com/p/known-link'),
  note('seeded', '2026-09-15', 22),
]);
const skipped = [];
const out = plan([
  item('known-slug', 'Tue, 01 Sep 2026 20:00:00 GMT'),
  item('known-link', 'Tue, 08 Sep 2026 20:00:00 GMT'),
  item('same-week-as-seeded', 'Wed, 16 Sep 2026 20:00:00 GMT'),
  item('new-one', 'Thu, 01 Oct 2026 20:00:00 GMT'),
  item('same-day-as-new-one', 'Thu, 01 Oct 2026 21:00:00 GMT'),
  item('new-two', 'Thu, 08 Oct 2026 20:00:00 GMT'),
  item('new-two', 'Thu, 08 Oct 2026 20:00:00 GMT'),
], existing, (m) => skipped.push(m));
assert.deepEqual(out.map((p) => [p.slug, p.week, p.date]), [
  ['same-week-as-seeded', 23, '2026-09-16'], ['new-one', 24, '2026-10-01'], ['same-day-as-new-one', 25, '2026-10-01'], ['new-two', 26, '2026-10-08'],
]);
assert.deepEqual(skipped, []);
assert.match(out[1].md(false), /^canonical: "https:\/\/ikigaicollective\.substack\.com\/p\/new-one"$/m);

// Cron handler: stub fetch
const rss = (items) => `<?xml version="1.0"?><rss><channel>${items.map((i) => `<item><title>${i.title}</title><link>${i.link}</link><pubDate>${i.pubDate}</pubDate><content:encoded><![CDATA[${i['content:encoded']}]]></content:encoded></item>`).join('')}</channel></rss>`;
const run = async ({ auth = 'Bearer sekret', feed, files, raw }) => {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url), m = init.method ?? 'GET';
    calls.push(`${m} ${u}`);
    if (u.startsWith('https://feed.test')) return new Response(rss(feed));
    if (u.includes('/contents/site/src/content/notes')) return new Response(JSON.stringify(files.map((name) => ({ name }))));
    if (u.startsWith('https://raw.githubusercontent.com/')) { const name = u.split('/').pop(); return raw(name); }
    if (u.endsWith('/git/ref/heads/site-v2')) return new Response(JSON.stringify({ object: { sha: 'head' } }));
    if (u.endsWith('/git/commits/head')) return new Response(JSON.stringify({ tree: { sha: 'base' } }));
    if (m === 'POST' || m === 'PATCH') return new Response(JSON.stringify({ sha: 'new' }));
    return new Response('not found', { status: 404 });
  };
  const res = await GET(new Request('https://x.test/api/cron/substack', { headers: auth ? { authorization: auth } : {} }));
  return { status: res.status, body: await res.json(), calls, writes: calls.filter((c) => /^(POST|PATCH) /.test(c)) };
};
const feed = [item('a', 'Thu, 01 Oct 2026 20:00:00 GMT'), item('b', 'Thu, 08 Oct 2026 20:00:00 GMT')];
const notes = { 'a.md': note('a', '2026-10-01', 25, feed[0].link), 'b.md': note('b', '2026-10-08', 26, feed[1].link) };

// unauthenticated: 401 before any fetch
let r = await run({ auth: null, feed, files: Object.keys(notes), raw: (n) => new Response(notes[n]) });
assert.equal(r.status, 401);
assert.equal(r.calls.length, 0, 'no fetch without the cron secret');
r = await run({ auth: 'Bearer wrong', feed, files: Object.keys(notes), raw: (n) => new Response(notes[n]) });
assert.equal(r.status, 401);
assert.equal(r.calls.length, 0);

// everything known: nothing written
r = await run({ feed, files: Object.keys(notes), raw: (n) => new Response(notes[n]) });
assert.equal(r.status, 200);
assert.deepEqual(r.body.wouldImport, []);
assert.equal(r.writes.length, 0);

// a raw fetch fails: error, nothing written
r = await run({ feed, files: Object.keys(notes), raw: (n) => (n === 'b.md' ? new Response('rate limited', { status: 429 }) : new Response(notes[n])) });
assert.equal(r.status, 502);
assert.equal(r.writes.length, 0, 'failed raw fetch must not import');

// a raw fetch returns text with no frontmatter: the file name still marks the slug as known
r = await run({ feed, files: Object.keys(notes), raw: (n) => new Response(n === 'b.md' ? 'garbage' : notes[n]) });
assert.equal(r.status, 200);
assert.deepEqual(r.body.wouldImport, []);
assert.equal(r.writes.length, 0);

// a genuinely new post is committed to the default repo path
r = await run({ feed: [...feed, item('c', 'Thu, 15 Oct 2026 20:00:00 GMT')], files: Object.keys(notes), raw: (n) => new Response(notes[n]) });
assert.equal(r.status, 200);
assert.deepEqual(r.body.wouldImport.map((p) => [p.slug, p.week]), [['c', 27]]);
assert.ok(r.writes.some((c) => c.endsWith('/repos/org/repo/git/refs/heads/site-v2')));
// GITHUB_REPO unset: the default is this repository, not a personal path
delete process.env.GITHUB_REPO;
const fresh = await import('../api/cron/substack.ts?default-repo');
const seen = [];
globalThis.fetch = async (url) => { seen.push(String(url)); return String(url).startsWith('https://feed.test') ? new Response(rss(feed)) : new Response('[]'); };
await fresh.GET(new Request('https://x.test/api/cron/substack', { headers: { authorization: 'Bearer sekret' } }));
assert.ok(seen.some((u) => u.startsWith('https://api.github.com/repos/ikigaicollective/ikigaicollective/')), seen.join('\n'));
console.log('substack: all passed');
