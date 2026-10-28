// Read-only MCP server for the public site (8-week pilot). Stateless Streamable HTTP: a fresh server per request, no sessions, no secrets.
// Content comes from the site's own public build output: /lab-notes/notes.json plus the markdown twin of every page (<path>.md).
// Logging: one line per tool call with the tool name and the query, and one line per initialize with the client app's name and version
// (clientInfo, e.g. "claude-code" / "1.2.3"), to count connected agents. Nothing about the person: no IPs, no headers, nothing stored.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';

export const ORIGIN = 'https://ikigaicollective.org';
export type Page = { path: string; title: string; about: string };
type Note = { title: string; slug: string; week: number; date: string; summary: string; url: string; markdown: string };
type Doc = { kind: 'page' | 'note'; path: string; title: string; summary: string; date?: string; week?: number; body?: string };
export type Options = { pages: Page[]; contentOrigin?: string; fetch?: typeof fetch; log?: (line: string) => void; now?: () => number };

const INSTRUCTIONS = `Public, read-only content of Ikigai Collective (${ORIGIN}): the Lab Notes and the site's key pages. Content is CC BY-SA 4.0.
Use "search" to find notes or pages, then "show_page" to read one in full as markdown.
Answer briefly and always give the link to the page you used. If nothing matches, say so and point to ${ORIGIN}/lab-notes.`;
const FALLBACK = `Browse the Lab Notes at ${ORIGIN}/lab-notes or the site map for agents at ${ORIGIN}/llms.txt.`;
const TTL = 5 * 60_000;
const MAX_BODY = 64 * 1024;
const MAX_PAGE = 40_000;

// ---------- content (cached per instance for 5 minutes) ----------
let cache: { key: string; at: number; docs: Promise<Doc[]> } | undefined;

const mdPath = (path: string) => (path === '/' ? '/index' : path) + '.md';
const urlOf = (path: string) => ORIGIN + path;
const fold = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const STOP = new Set(['the', 'and', 'of', 'to', 'in', 'an', 'is', 'for', 'on', 'with', 'what', 'our', 'we', 'il', 'la', 'di', 'che', 'e']);
const stem = (w: string) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const words = (s: string) => (fold(s).match(/[\p{L}\p{N}]+/gu) ?? []).map(stem);

async function get(o: Options, path: string, ms = 5000) {
  const f = o.fetch ?? fetch;
  const r = await f(new URL(path, o.contentOrigin ?? ORIGIN).href, { signal: AbortSignal.timeout(ms), headers: { 'user-agent': 'ikigai-mcp' } });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.text();
}
// Drop the twin's header comment and make site-relative links absolute, so the markdown stands on its own.
const clean = (md: string) => md.replace(/^<!--[^\n]*-->\s*/, '').replace(/\]\(\//g, `](${ORIGIN}/`).trim();

export function loadDocs(o: Options): Promise<Doc[]> {
  const key = o.contentOrigin ?? ORIGIN, now = (o.now ?? Date.now)();
  if (cache && cache.key === key && now - cache.at < TTL) return cache.docs;
  const docs = (async () => {
    const index = JSON.parse(await get(o, '/lab-notes/notes.json')) as { notes: Note[] };
    const all: Doc[] = [
      ...o.pages.map((p) => ({ kind: 'page' as const, path: p.path, title: p.title, summary: p.about })),
      ...index.notes.map((n) => ({ kind: 'note' as const, path: `/lab-notes/${n.slug}`, title: n.title, summary: n.summary, date: n.date.slice(0, 10), week: n.week })),
    ];
    // Bodies make search useful; a body that fails to load just leaves that doc searchable by title and summary.
    await Promise.all(all.map(async (d) => { d.body = await get(o, mdPath(d.path)).then(clean, () => undefined); }));
    return all;
  })();
  cache = { key, at: now, docs };
  docs.catch(() => { if (cache?.docs === docs) cache = undefined; });
  return docs;
}
export const resetCache = () => { cache = undefined; };

// ---------- search ----------
export function search(docs: Doc[], query: string, limit = 5) {
  const terms = [...new Set(words(query))].filter((t) => t.length > 1 && !STOP.has(t));
  if (!terms.length) return [];
  const phrase = fold(query.trim());
  return docs
    .map((d) => {
      const t = words(d.title), s = words(d.summary), b = d.body ? words(d.body) : [];
      let score = 0, hit = 0;
      for (const q of terms) {
        const c = (ws: string[]) => ws.filter((w) => w === q || (q.length > 3 && w.startsWith(q))).length;
        const ct = c(t), cs = c(s), cb = Math.min(c(b), 10);
        if (ct || cs || cb) hit++;
        score += ct * 6 + cs * 3 + cb;
      }
      if (fold(d.title).includes(phrase)) score += 10;
      else if (d.body && fold(d.body).includes(phrase)) score += 4;
      score *= hit / terms.length; // reward docs that match more of the query
      return { d, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (b.d.date ?? '').localeCompare(a.d.date ?? ''))
    .slice(0, limit)
    .map(({ d }) => ({ ...d, snippet: snippet(d, terms) }));
}

function snippet(d: Doc, terms: string[]) {
  const body = (d.body ?? '').replace(/^[\s\S]*?^# [^\n]*\n/m, ''); // skip the kicker and title above the H1
  const text = body.replace(/[#*_>\[\]]|\(\/[^)]*\)|\(https?:[^)]*\)/g, '').replace(/\s+/g, ' ');
  const f = fold(text);
  const at = Math.min(...terms.map((t) => f.indexOf(t)).filter((i) => i >= 0));
  if (!Number.isFinite(at)) return '';
  const start = Math.max(0, at - 80);
  return (start ? '…' : '') + text.slice(start, start + 240).trim() + '…';
}

// ---------- show_page: resolve slugs, paths and URLs to a known page (allowlist only) ----------
const SITE_HOSTS = ['ikigaicollective.org', 'www.ikigaicollective.org'];
const hostOf = (u?: string) => { try { return u ? new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u).hostname.toLowerCase() : ''; } catch { return ''; } };
export function resolve(docs: Doc[], input: string, extraHosts: string[] = []): Doc | undefined {
  let p = input.trim();
  if (p.startsWith('//') || p.includes('\\')) return undefined; // protocol-relative or backslash tricks
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) {
    // full URL: only http(s), no userinfo, and only our own hosts; nothing else is resolved (or fetched)
    let u: URL;
    try { u = new URL(p); } catch { return undefined; }
    const ok = [...SITE_HOSTS, ...extraHosts.map(hostOf).filter(Boolean)];
    if (!/^https?:$/.test(u.protocol) || u.username || u.password || !ok.includes(u.hostname.toLowerCase())) return undefined;
    p = u.pathname;
  }
  p = p.replace(/[?#].*$/, '').replace(/\.(md|html)$/i, '').replace(/\/+$/, '').toLowerCase();
  if (p === '' || p === '/index' || p === 'index' || p === 'home') p = '/';
  if (!p.startsWith('/')) p = '/' + p;
  return docs.find((d) => d.path === p) ?? docs.find((d) => d.kind === 'note' && d.path === '/lab-notes' + p);
}

// ---------- the MCP server ----------
const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });
const line = (d: Doc) => `- ${d.title}${d.kind === 'note' ? ` (Lab Note, week ${d.week}, ${d.date})` : ' (page)'}: ${urlOf(d.path)}\n  ${d.summary}`;

export function createServer(o: Options) {
  const log = o.log ?? ((l: string) => console.log(l));
  const server = new McpServer({ name: 'ikigai-collective', version: '0.1.0' }, { instructions: INSTRUCTIONS });
  const ro = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

  server.registerTool('search', {
    title: 'Search Ikigai Collective',
    description: 'Search the Lab Notes and key pages of ikigaicollective.org. Returns the best matches with title, link, date and a short summary. Use show_page to read one in full.',
    inputSchema: { query: z.string().min(1).max(200).describe('Words to look for, e.g. "values", "Lab Night", "tsundoku"'), limit: z.number().int().min(1).max(10).optional().describe('Max results, default 5') },
    annotations: ro,
  }, async ({ query, limit }) => {
    log(JSON.stringify({ mcp: 'search', query }));
    let docs: Doc[];
    try { docs = await loadDocs(o); } catch { return text(`The content index is unavailable right now. ${FALLBACK}`); }
    const hits = search(docs, query, limit ?? 5);
    if (!hits.length) return text(`Nothing on ikigaicollective.org matches "${query}". ${FALLBACK}`);
    return text(`${hits.length} result${hits.length > 1 ? 's' : ''} for "${query}":\n\n` + hits.map((h) => line(h) + (h.snippet ? `\n  > ${h.snippet}` : '')).join('\n') + `\n\nRead one in full with show_page (pass the link or the slug).`);
  });

  server.registerTool('show_page', {
    title: 'Show a page or Lab Note',
    description: 'Return the full markdown of one page or Lab Note from ikigaicollective.org. Accepts a link (https://ikigaicollective.org/lab-notes/tsundoku), a path (/how-it-works) or a Lab Note slug (tsundoku).',
    inputSchema: { page: z.string().min(1).max(300).describe('Link, path or Lab Note slug') },
    annotations: ro,
  }, async ({ page }) => {
    log(JSON.stringify({ mcp: 'show_page', query: page }));
    let docs: Doc[];
    try { docs = await loadDocs(o); } catch { return text(`The content index is unavailable right now. ${FALLBACK}`); }
    const d = resolve(docs, page, [o.contentOrigin ?? '', process.env.VERCEL_URL ?? '', process.env.VERCEL_BRANCH_URL ?? '']);
    if (!d) {
      const near = search(docs, page.replace(/^.*?lab-notes\/?|\.(md|html)$/gi, '').replace(/[-/_.]/g, ' '), 3);
      return text(`Not found: "${page}" is not a page or Lab Note on ikigaicollective.org.` + (near.length ? `\n\nDid you mean:\n${near.map(line).join('\n')}` : '') + `\n\n${FALLBACK}`);
    }
    const body = d.body ?? (await get(o, mdPath(d.path)).then(clean, () => undefined));
    if (!body) return text(`${d.title}: ${d.summary}\nRead it at ${urlOf(d.path)}`);
    const cut = body.length > MAX_PAGE ? body.slice(0, MAX_PAGE) + `\n\n[…truncated, full text at ${urlOf(d.path)}]` : body;
    return text(`Source: ${urlOf(d.path)} (CC BY-SA 4.0, Ikigai Collective)\n\n${cut}`);
  });
  return server;
}

// ---------- HTTP: CORS, simple rate limit, body cap, then the SDK transport ----------
// Rate limit: fixed 60-second window per client, in memory, per serverless instance (so the effective limit is per warm instance).
// The client key is the first x-forwarded-for address, used only as a map key in memory: never logged, never stored.
export const LIMIT = 60;
const hits = new Map<string, { start: number; n: number }>();
export function limited(key: string, now: number) {
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v.start >= 60_000) hits.delete(k);
  const h = hits.get(key);
  if (!h || now - h.start >= 60_000) { hits.set(key, { start: now, n: 1 }); return false; }
  return ++h.n > LIMIT;
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, GET, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, mcp-protocol-version, mcp-session-id, last-event-id',
  'access-control-expose-headers': 'mcp-session-id',
};
const rpcError = (status: number, code: number, message: string, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id: null }), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...CORS, ...extra } });

// The client app's self-reported name and version, trimmed to short plain strings. Nothing else from clientInfo is kept.
const short = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, n) : '');
export function clientOf(info: unknown): { name: string; version?: string } | undefined {
  if (!info || typeof info !== 'object') return undefined;
  const { name, version } = info as Record<string, unknown>;
  const n = short(name, 100), v = short(version, 50);
  return n ? (v ? { name: n, version: v } : { name: n }) : undefined;
}

export async function handle(req: Request, o: Options): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  // Stateless server: no SSE stream to resume and no session to delete.
  if (req.method !== 'POST') return rpcError(405, -32000, 'Method not allowed. This MCP endpoint is stateless: POST JSON-RPC to it.', { allow: 'POST, OPTIONS' });
  const now = (o.now ?? Date.now)();
  if (limited(req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anon', now)) return rpcError(429, -32000, `Rate limit: ${LIMIT} requests per minute. Try again shortly.`, { 'retry-after': '60' });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return rpcError(413, -32600, 'Request too large');
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return rpcError(400, -32700, 'Parse error'); }

  const server = createServer(o);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    const res = await transport.handleRequest(req, { parsedBody: body });
    // Stateless: clientInfo arrives only with initialize (set by the SDK once it has validated the request), never with later tool calls.
    const client = clientOf(server.server.getClientVersion());
    if (client) (o.log ?? ((l: string) => console.log(l)))(JSON.stringify({ mcp: 'initialize', client }));
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    headers.set('cache-control', 'no-store');
    return new Response(await res.text(), { status: res.status, headers });
  } finally {
    await server.close();
  }
}
