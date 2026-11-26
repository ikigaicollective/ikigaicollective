// Lab Night schedule: the one place the time lives. Everything else reads from here.
// Always computed in the Rome zone so the summer/winter change is correct,
// then shown to the visitor in their own zone.
export const LAB_NIGHT = {
  tz: 'Europe/Rome',
  weekday: 4, // Thursday (Sunday = 0)
  hour: 16,
  minute: 0,
  durationMin: 60,
} as const;
const hhmm = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
const endMin = LAB_NIGHT.hour * 60 + LAB_NIGHT.minute + LAB_NIGHT.durationMin;
export const LAB_NIGHT_START = hhmm(LAB_NIGHT.hour, LAB_NIGHT.minute); // "16:00"
export const LAB_NIGHT_END = hhmm(Math.floor(endMin / 60), endMin % 60); // "17:00"
export const LAB_NIGHT_LABEL = `${LAB_NIGHT_START} Rome`;
const TZ = LAB_NIGHT.tz;
const DURATION = LAB_NIGHT.durationMin * 60_000;
const DAY = 86_400_000;

function romeParts(t: number) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short',
    }).formatToParts(new Date(t)).map((x) => [x.type, x.value]),
  );
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second, wd: p.weekday };
}

/** UTC ms of a wall-clock time in Rome. Two passes cover the DST edge. */
function romeToUtc(y: number, mo: number, d: number, h: number, mi = 0) {
  const want = Date.UTC(y, mo - 1, d, h, mi);
  let guess = want;
  for (let i = 0; i < 2; i++) {
    const r = romeParts(guess);
    guess += want - Date.UTC(r.y, r.mo - 1, r.d, r.h, r.mi);
  }
  return guess;
}

/** Start (UTC ms) of the Lab Night that is live now or next. */
export function nextLabNight(now = Date.now()) {
  const r = romeParts(now);
  const idx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(r.wd);
  let ahead = ((LAB_NIGHT.weekday + 6) % 7 - idx + 7) % 7;
  for (let i = 0; i < 2; i++) {
    const day = romeParts(now + (ahead + i * 7) * DAY);
    const start = romeToUtc(day.y, day.mo, day.d, LAB_NIGHT.hour, LAB_NIGHT.minute);
    if (now < start + DURATION) return start;
  }
  return romeToUtc(r.y, r.mo, r.d + ahead + 7, LAB_NIGHT.hour, LAB_NIGHT.minute);
}

export function pillText(start: number, locale = 'en-GB', tz?: string) {
  const date = new Intl.DateTimeFormat(locale, { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(start);
  const local = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(start);
  return { date, local };
}

export type Phase = 'idle' | 'tonight' | 'live';
const HOUR = 3_600_000;
/** idle: any other time. tonight: the 3 hours before the start. live: from the start for LAB_NIGHT.durationMin. */
export function labNightPhase(now = Date.now()): { phase: Phase; start: number; msToStart: number } {
  const start = nextLabNight(now);
  const msToStart = start - now;
  const phase: Phase = msToStart <= 0 ? 'live' : msToStart <= 3 * HOUR ? 'tonight' : 'idle';
  return { phase, start, msToStart };
}

/** Weekday, day and month of the Lab Night in Rome, for the invite ticket's calendar tile. */
export function tileParts(start: number) {
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...o }).format(start);
  return { wd: f({ weekday: 'short' }).toUpperCase(), day: f({ day: 'numeric' }), mon: f({ month: 'short' }).toUpperCase() };
}
