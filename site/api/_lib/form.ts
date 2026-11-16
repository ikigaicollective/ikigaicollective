// Shared checks for the public forms: JSON body, honeypot, Turnstile, trimmed fields.
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

export async function read(req: Request, fields: Record<string, number>) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'bad-json' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'bad-json' }, 400);
  if (body.website) return json({ ok: true }); // honeypot: pretend success
  const out: Record<string, string> = {};
  for (const [k, max] of Object.entries(fields)) out[k] = String(body[k] ?? '').trim().slice(0, max);
  if (!(await human(String(body['cf-turnstile-response'] ?? ''), req))) return json({ error: 'turnstile' }, 400);
  return out;
}

async function human(token: string, req: Request) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return process.env.PUBLIC_SITE_ENV !== 'production'; // unset: allowed in preview only
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret, response: token, remoteip: req.headers.get('x-forwarded-for')?.split(',')[0] ?? '' }),
    });
    return (await res.json()).success === true;
  } catch {
    return false; // network error or non-JSON reply: the form shows its retry message
  }
}
