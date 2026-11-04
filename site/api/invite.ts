import { addGuest, appendRow, configured, hasEmail, tab } from './_lib/google.js';
import { EMAIL, json, read } from './_lib/form.js';
import { isLive } from './_lib/site.js';

/** Add the guest to the event, then log the sign-up. Throws on failure. */
export async function signUp(email: string, name = '', source = '', live = false) {
  // Calendar first: if it fails nothing is recorded, so the person can retry. Sheet is the log.
  const { added } = await addGuest(email, live);
  const logged = !(await hasEmail(tab('Signups', live), email));
  if (logged) await appendRow(tab('Signups', live), [email, name, new Date().toISOString(), source]);
  return { added, logged };
}

export async function POST(req: Request) {
  const f = await read(req, { email: 254, name: 80, source: 120 });
  if (f instanceof Response) return f;
  const email = f.email.toLowerCase();
  if (!EMAIL.test(email)) return json({ error: 'email' }, 400);
  const live = isLive(req);
  if (!configured(live)) return json({ error: 'not-configured' }, 503);
  try {
    await signUp(email, f.name, f.source, live);
    return json({ ok: true, preview: !live });
  } catch (e) {
    console.error('invite failed', (e as Error).message);
    return json({ error: 'server' }, 502);
  }
}
