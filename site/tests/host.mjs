// Host decision for the forms: run with `node --experimental-strip-types tests/host.mjs`.
import assert from 'node:assert/strict';
const { isLive } = await import('../api/_lib/site.ts');
const req = (host, extra = {}) => new Request(`https://${host}/api/invite`, { headers: { host, ...extra } });

assert.equal(isLive(req('ikigaicollective.org'), {}), true, 'real domain: live');
assert.equal(isLive(req('www.ikigaicollective.org'), {}), true, 'www: live');
assert.equal(isLive(req('IkigaiCollective.org:443'), {}), true, 'case and port ignored');
assert.equal(isLive(req('ikigai-site-lyart.vercel.app'), {}), false, 'vercel.app: preview');
assert.equal(isLive(req('ikigaicollective.org.evil.com'), {}), false, 'lookalike: preview');
assert.equal(isLive(req('ikigaicollective.org'), { PUBLIC_FORMS_LIVE: '0' }), false, 'kill switch off: preview');
assert.equal(isLive(req('ikigaicollective.org'), { PUBLIC_FORMS_LIVE: '1' }), true, 'switch on: live');
assert.equal(isLive(req('x.vercel.app', { 'x-forwarded-host': 'ikigaicollective.org' }), {}), true, 'forwarded host wins');
console.log('host: all passed');
