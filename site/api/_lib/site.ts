// Live or preview, decided per request by Host. Only the real domain gets the real Lab Night event and plain sheet tabs.
// PUBLIC_FORMS_LIVE=0 is the kill switch: preview behaviour on every host.
export const LIVE_HOSTS = ['ikigaicollective.org', 'www.ikigaicollective.org'];

export function isLive(req: Request, env: Record<string, string | undefined> = process.env) {
  if (env.PUBLIC_FORMS_LIVE === '0') return false;
  const host = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host).split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
  return LIVE_HOSTS.includes(host);
}
