// Shared by scripts/import-substack.mjs (local/CI) and api/cron/substack.ts (Vercel cron): Substack feed -> note markdown.
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

export const FEED = process.env.SUBSTACK_FEED_URL ?? 'https://ikigaicollective.substack.com/feed';
const text = (v) => (typeof v === 'string' ? v : v?.__cdata ?? '');
const q = JSON.stringify;

export async function fetchFeed() {
  const res = await fetch(FEED, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; IkigaiSiteImporter/1.0; +https://ikigaicollective.org)', accept: 'application/rss+xml, application/xml' } });
  const raw = await res.text();
  if (!res.ok || !raw.includes('<rss')) throw new Error(`Feed fetch failed: HTTP ${res.status}, ${raw.slice(0, 120).replace(/\s+/g, ' ')}`);
  const xml = new XMLParser({ cdataPropName: '__cdata', ignoreAttributes: false, attributeNamePrefix: '@' }).parse(raw);
  return [xml.rss.channel.item ?? []].flat().reverse(); // oldest first
}

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', emDelimiter: '*' });
td.remove(['style', 'script', 'form', 'button']);
td.addRule('substackBlocks', { filter: (n) => n.nodeName === 'DIV' && /subscription-widget|share-widget|button-wrapper/.test(n.className), replacement: () => '' });
td.addRule('figure', { filter: 'figure', replacement: (c) => `\n\n${c.trim()}\n\n` });

/** Existing note frontmatter strings -> facts needed to avoid duplicates. */
export const facts = (mds) => mds.map((s) => ({
  t: +new Date(s.match(/^date: (\S+)/m)?.[1]),
  slug: s.match(/^slug: "?([^"\n]+)"?/m)?.[1],
  canonical: s.match(/^canonical: "?(.+?)"?$/m)?.[1],
  week: +s.match(/^week: (\d+)/m)?.[1] || 0,
}));

/** New posts only: skips a post whose link is known or whose slug exists. Every other distinct post is imported.
 * @param {(message: string) => unknown} [log] */
export function plan(items, existing, log = () => {}) {
  const days = [...existing];
  let week = Math.max(0, ...days.map((d) => d.week));
  const out = [];
  for (const it of items) {
    const link = text(it.link);
    const slug = link.split('/p/')[1];
    if (!slug || days.some((d) => d.canonical === link || d.slug === slug)) continue;
    const when = +new Date(text(it.pubDate));
    const body = td.turndown(text(it['content:encoded'])).replace(/\n{3,}/g, '\n\n').replace(/^\s*\[\s*!\[[^\]]*\]\([^)]*\)\s*\]\([^)]*\)\s*/, ''); // leading hero image duplicates the cover
    const date = new Date(when).toISOString().slice(0, 10);
    week += 1; // ponytail: next number in sequence; edit by hand when a post is not a Lab Night note
    days.push({ t: when, slug, canonical: link, week });
    const img = it.enclosure?.['@url'];
    out.push({
      slug, date, week, coverUrl: img, chars: body.length,
      md: (cover) => `---\ntitle: ${q(text(it.title))}\ndate: ${date}\nweek: ${week}\nslug: ${q(slug)}\n${cover ? `cover: ../../assets/covers/${slug}.jpg\n` : ''}excerpt: ${q(text(it.description) || body.split('\n\n')[0].slice(0, 190))}\ncanonical: ${q(link)}\nsource: substack\n---\n\n${body}\n`,
    });
  }
  return out;
}

export const download = async (url) => { const r = await fetch(url); return r.ok ? Buffer.from(await r.arrayBuffer()) : null; };
