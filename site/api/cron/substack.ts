import { download, facts, fetchFeed, plan } from '../_lib/substack.js';

// Daily Vercel cron: import new Substack posts and commit them to the repo in ONE commit (which triggers a rebuild).
// Auth: Vercel sends `Authorization: Bearer $CRON_SECRET`; any other caller gets 401 before any fetch. Without GITHUB_CONTENT_TOKEN this only reports what it would do.
const repo = process.env.GITHUB_REPO ?? 'ikigaicollective/ikigaicollective';
const branch = process.env.GITHUB_BRANCH ?? 'site-v2';
const token = process.env.GITHUB_CONTENT_TOKEN;
const res = (body: unknown, status = 200) => new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const gh = async (path: string, init: RequestInit = {}) => {
  const r = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init, headers: { accept: 'application/vnd.github+json', 'user-agent': 'ikigai-site-cron', ...(token ? { authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (!r.ok) throw new Error(`github ${r.status} ${init.method ?? 'GET'} ${path}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
};

export async function GET(req: Request) {
  const authed = !!process.env.CRON_SECRET && req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
  if (!authed) return res({ error: 'unauthorized' }, 401);
  try {
    const items = await fetchFeed();
    const files: { name: string }[] = await gh(`/contents/site/src/content/notes?ref=${branch}`);
    const names = files.filter((f) => f.name.endsWith('.md')).map((f) => f.name);
    const mds = await Promise.all(names.map(async (name) => {
      const r = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/site/src/content/notes/${name}`);
      if (!r.ok) throw new Error(`raw ${r.status} ${name}`); // never treat an unreadable note as missing: that would re-import it
      return r.text();
    }));
    // The file names are known slugs too, so a note whose frontmatter did not parse is still not imported again.
    const known = [...facts(mds), ...names.map((name) => ({ t: NaN, slug: name.slice(0, -3), canonical: undefined, week: 0 }))];
    const skipped: string[] = [];
    const todo = plan(items, known, (m: string) => skipped.push(m));
    const summary = { feedItems: items.length, existing: mds.length, skipped, wouldImport: todo.map((p) => ({ slug: p.slug, date: p.date, week: p.week })) };
    if (!todo.length || !token) return res({ ...summary, committed: null, mode: token ? 'live' : 'report-only' });

    const head = (await gh(`/git/ref/heads/${branch}`)).object.sha;
    const base = (await gh(`/git/commits/${head}`)).tree.sha;
    const blob = async (content: string, encoding: 'utf-8' | 'base64') => (await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content, encoding }) })).sha;
    const tree = [];
    for (const p of todo) {
      const img = p.coverUrl ? await download(p.coverUrl) : null;
      if (img) tree.push({ path: `site/src/assets/covers/${p.slug}.jpg`, mode: '100644', type: 'blob', sha: await blob(img.toString('base64'), 'base64') });
      tree.push({ path: `site/src/content/notes/${p.slug}.md`, mode: '100644', type: 'blob', sha: await blob(p.md(!!img), 'utf-8') });
    }
    const newTree = (await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base, tree }) })).sha;
    const commit = (await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message: `content: import ${todo.map((p) => p.slug).join(', ')} from Substack`, tree: newTree, parents: [head] }) })).sha;
    await gh(`/git/refs/heads/${branch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit }) });
    return res({ ...summary, committed: commit, mode: 'live' });
  } catch (e) {
    console.error('substack cron failed', (e as Error).message);
    return res({ error: (e as Error).message }, 502);
  }
}
