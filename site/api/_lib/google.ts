// Google APIs over plain fetch with one OAuth refresh token (dedicated Ikigai account, app published "In production").
// Scopes: calendar.events, spreadsheets. `live` comes from the request host (_lib/site.ts); preview uses the test event and the '-test' tabs.
const env = (k: string) => process.env[k];
/** Sheet tab name: test tabs in preview so real sign-ups stay clean. */
export const tab = (name: string, live: boolean) => (live ? name : `${name}-test`);
export const configured = (live: boolean) => ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'SHEET_ID'].every(env) && !!(live ? env('LAB_NIGHT_EVENT_ID') : env('LAB_NIGHT_EVENT_ID_PREVIEW'));

let cached: { token: string; exp: number } | undefined;
async function accessToken() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: env('GOOGLE_CLIENT_ID')!, client_secret: env('GOOGLE_CLIENT_SECRET')!, refresh_token: env('GOOGLE_REFRESH_TOKEN')!, grant_type: 'refresh_token' }),
  });
  if (!res.ok) throw new Error(`google token ${res.status}`);
  const j = await res.json();
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

export async function g(url: string, init: RequestInit = {}) {
  const res = await fetch(url, { ...init, headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...init.headers } });
  if (!res.ok) throw new Error(`google ${res.status} ${url.split('?')[0]}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// David's Meet link lives in the event location (fallback: description), not in conferenceData.
const MEET = /https:\/\/meet\.google\.com\/[a-z0-9-]+/i;
export const meetLink = (ev: any): string | undefined => (String(ev.location ?? '').match(MEET) ?? String(ev.description ?? '').match(MEET))?.[0].toLowerCase();

/** Log to the Alerts tab (the sheet's own "notify me right away" rule emails the owner). Never throws. */
export async function alert(subject: string, text: string, live: boolean) {
  console.error('ALERT', subject, text);
  await appendRow(tab('Alerts', live), [new Date().toISOString(), subject, text]).catch(() => {});
}

// Add a guest to the Lab Night event. Patches ONLY `attendees` (no conferenceDataVersion, so conferenceData/location/description cannot change).
// Before the patch the Meet link must exist (and in production equal PUBLIC_MEET_URL) and guests must be hidden.
// After it the link, location, description and conferenceData must be identical and guests still hidden. Otherwise roll back and alert.
export async function addGuest(email: string, live: boolean) {
  const cal = encodeURIComponent(env('GOOGLE_CALENDAR_ID') ?? 'primary');
  const id = encodeURIComponent((live ? env('LAB_NIGHT_EVENT_ID') : env('LAB_NIGHT_EVENT_ID_PREVIEW'))!);
  const base = `https://www.googleapis.com/calendar/v3/calendars/${cal}/events/${id}`;
  const expected = env('PUBLIC_MEET_URL')?.replace(/\/$/, '').toLowerCase();

  const ev = await g(base);
  const link = meetLink(ev);
  const before = ev.guestsCanSeeOtherGuests !== false ? 'guestsCanSeeOtherGuests is not false' : !link ? 'no Meet link found in the event location or description' : live && link !== expected ? `Meet link ${link} is not PUBLIC_MEET_URL (${expected})` : '';
  if (before) { await alert('Lab Night event is wrong, sign-ups paused', `${before}\nEvent ${ev.id}. No guest was added.`, live); throw new Error(before); }
  const attendees: { email: string }[] = ev.attendees ?? [];
  if (attendees.some((a) => a.email.toLowerCase() === email)) return { added: false };

  const out = await g(`${base}?sendUpdates=all`, { method: 'PATCH', body: JSON.stringify({ attendees: [...attendees, { email }] }) });
  const same = (k: string) => JSON.stringify(out[k] ?? null) === JSON.stringify(ev[k] ?? null);
  const after = out.guestsCanSeeOtherGuests !== false ? 'guestsCanSeeOtherGuests is not false' : meetLink(out) !== link ? `Meet link changed to ${meetLink(out)}` : !['location', 'description', 'conferenceData'].every(same) ? 'location, description or conferenceData changed' : '';
  if (after) {
    await g(`${base}?sendUpdates=none`, { method: 'PATCH', body: JSON.stringify({ attendees }) }).catch(() => {});
    await alert('Lab Night event changed after a sign-up, rolled back', `${after}\nEvent ${out.id}. The guest list was restored; check the event by hand (the Meet link must stay David's).`, live);
    throw new Error(after);
  }
  return { added: true };
}

export async function appendRow(sheetTab: string, row: string[]) {
  const id = env('SHEET_ID')!;
  await g(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(sheetTab + '!A:F')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST', body: JSON.stringify({ values: [row] }),
  });
}

export async function hasEmail(sheetTab: string, email: string) {
  const id = env('SHEET_ID')!;
  const j = await g(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(sheetTab + '!A:A')}`);
  return (j.values ?? []).some((r: string[]) => r[0]?.toLowerCase() === email);
}
