import { getNotes } from '../lib/notes';
import { ORIGIN, PAGES } from '../lib/seo';
import { LAB_NIGHT_LABEL } from '../lib/labnight';

// llms.txt: a plain-text map for agents. Every page also exists as markdown at <url>.md (home: /index.md).
export async function GET() {
  const notes = (await getNotes()).reverse();
  const md = (p: string) => `${ORIGIN}${p === '/' ? '/index' : p}.md`;
  const text = `# Ikigai Collective

> A studio for people using AI to design their lives. We meet every Thursday at ${LAB_NIGHT_LABEL} time for Lab Night, publish what we try in open Lab Notes, and keep three values as the only membership requirement: curiosity, agency and compassion. Free to join.

Members are not named in Lab Notes. Content is CC BY-SA 4.0, code is MIT.

## Pages

${PAGES.filter((p) => p.path !== '/connect').map((p) => `- [${p.title}](${md(p.path)}): ${p.about}`).join('\n')}

## Lab Notes

${notes.map((n) => `- [${n.title}](${ORIGIN}/lab-notes/${n.slug}.md): Week ${n.week}, ${n.long}. ${n.excerpt}`).join('\n')}

## Other

- [Lab Notes feed](${ORIGIN}/lab-notes/rss.xml)
- [Lab Notes JSON index](${ORIGIN}/lab-notes/notes.json): every note with title, date, summary, URL and markdown URL, newest first
- [Sitemap](${ORIGIN}/sitemap.xml)
- [MCP server](${ORIGIN}/mcp): read-only, Streamable HTTP, tools search and show_page over the Lab Notes and key pages
- [Connect your agent](${ORIGIN}/connect.md): how to add the MCP server in Claude, Claude Code, Cursor and other apps
- [Discord](https://discord.gg/4rM6FqjVDE): where the studio lives between Thursdays
- [Substack](https://ikigaicollective.substack.com/)
`;
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
