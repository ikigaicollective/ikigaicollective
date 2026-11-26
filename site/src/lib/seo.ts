import { LAB_NIGHT, LAB_NIGHT_START, LAB_NIGHT_END, LAB_NIGHT_LABEL } from './labnight';

export const ORIGIN = 'https://ikigaicollective.org';

/** Every static page: path, title, one-line summary (sitemap, llms.txt). */
export const PAGES = [
  { path: '/', title: 'Home', about: 'Life design through experimentation. A weekly Lab Night for people building toward meaning.' },
  { path: '/lab-night', title: 'Lab Night', about: `Every Thursday, one hour, ${LAB_NIGHT_LABEL} time. Members show the week\'s work, think out loud together and leave with a question.` },
  { path: '/lab-notes', title: 'Lab Notes', about: 'Weekly notes from every Lab Night since the first.' },
  { path: '/how-it-works', title: 'How it works', about: 'We operate like an artist studio: three values, one loop, no assigned tasks.' },
  { path: '/horizon', title: 'Horizon', about: 'Where the Collective is going.' },
  { path: '/partners', title: 'Partners', about: 'Participants in the studio, not sponsors of it.' },
  { path: '/connect', title: 'Connect your agent', about: 'Connect the AI you already use to the Collective: a read-only server that searches the Lab Notes and the site and answers with a link to the source.' },
  { path: '/join', title: 'Join', about: 'Three steps, free: get the Lab Night invite, join the Discord, introduce yourself.' },
  { path: '/terms', title: 'Terms of Use', about: 'Terms of use for ikigaicollective.org.' },
  { path: '/privacy', title: 'Privacy Policy', about: 'What this site collects, where it is stored, and how to be removed.' },
];

export const organization = {
  '@type': 'Organization',
  '@id': `${ORIGIN}/#org`,
  name: 'Ikigai Collective',
  url: ORIGIN,
  logo: `${ORIGIN}/ikigaicollective-logo.jpg`,
  description: 'A studio for people using AI to design their lives, meeting weekly at Lab Night.',
  sameAs: ['https://ikigaicollective.substack.com/', 'https://www.linkedin.com/company/joinikigai', 'https://github.com/ikigaicollective', 'https://discord.gg/4rM6FqjVDE'],
};

export const homeLd = [
  { '@context': 'https://schema.org', ...organization },
  { '@context': 'https://schema.org', '@type': 'WebSite', url: ORIGIN, name: 'Ikigai Collective', publisher: { '@id': `${ORIGIN}/#org` } },
];

// Weekly recurring online event. startDate is the first Thursday after the first note (22 April 2026).
export const eventLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Ikigai Collective Lab Night',
  description: 'A weekly one-hour online session where members show the week\'s work, think out loud together and leave with a question.',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  startDate: `2026-04-23T${LAB_NIGHT_START}:00+02:00`,
  endDate: `2026-04-23T${LAB_NIGHT_END}:00+02:00`,
  eventSchedule: { '@type': 'Schedule', repeatFrequency: 'P1W', byDay: 'https://schema.org/Thursday', startTime: `${LAB_NIGHT_START}:00`, endTime: `${LAB_NIGHT_END}:00`, scheduleTimezone: LAB_NIGHT.tz },
  location: { '@type': 'VirtualLocation', url: `${ORIGIN}/lab-night` },
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', url: `${ORIGIN}/join`, availability: 'https://schema.org/InStock' },
  organizer: { '@id': `${ORIGIN}/#org` },
};

export const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
