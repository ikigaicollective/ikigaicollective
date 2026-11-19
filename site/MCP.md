# MCP server (read-only pilot)

`https://ikigaicollective.org/mcp` is a read-only [Model Context Protocol](https://modelcontextprotocol.io) server, so AI assistants and agents can look up the Lab Notes and the site's key pages and answer with a link to the source.

- **Transport:** Streamable HTTP, stateless (no sessions, plain JSON responses). POST only.
- **Content:** public only. The Lab Notes JSON index (`/lab-notes/notes.json`, also served at the old `/lab-notes/index.json`), the key pages, and their markdown twins (`<url>.md`). Content is CC BY-SA 4.0.
- **No auth, no secrets.** Nothing is written anywhere.

## Tools

| Tool | Input | Returns |
| --- | --- | --- |
| `search` | `query` (text), optional `limit` (1-10, default 5) | The best matching Lab Notes and pages: title, link, date, summary and a snippet |
| `show_page` | `page`: a link, a path (`/how-it-works`) or a Lab Note slug (`tsundoku`) | The full markdown of that page, with its source link |

Unknown pages don't fail: `show_page` answers "Not found", suggests the closest matches and links to `/lab-notes`. If content can't be loaded, both tools return a short answer with a link instead of an error. The server's instructions ask clients to answer briefly and always cite the link.

## Connect a client

The [Connect your agent](https://ikigaicollective.org/connect) page on the site walks through this step by step.

Most clients take a remote MCP server URL directly:

```json
{
  "mcpServers": {
    "ikigai-collective": { "url": "https://ikigaicollective.org/mcp" }
  }
}
```

- **Claude Code:** `claude mcp add --transport http ikigai-collective https://ikigaicollective.org/mcp`
- **Cursor:** add the JSON above to `.cursor/mcp.json` (or `~/.cursor/mcp.json`).
- **Clients that only speak stdio:** `npx mcp-remote https://ikigaicollective.org/mcp`
- **MCP Inspector:** `npx @modelcontextprotocol/inspector`, transport "Streamable HTTP", URL as above.

Quick check with curl:

```sh
curl -s https://ikigaicollective.org/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search","arguments":{"query":"values"}}}'
```

Before the switchover, use the preview deployment's `/mcp` instead.

## Limits and logging

- **Rate limit:** 60 requests per minute per client, counted in memory per serverless instance (no store, no secrets), so it's a soft limit. Over it: HTTP 429 with `Retry-After: 60`. The client key is the first `x-forwarded-for` address, held only in memory and never logged.
- **Logging:** two kinds of line, to count connected agents and see what people ask during the pilot:
  - one per `initialize`: `{"mcp":"initialize","client":{"name":"<app>","version":"<version>"}}`, the client app's self-reported `clientInfo` name and version (e.g. `claude-code`, `cursor`), trimmed to short strings. It identifies the app, not the person.
  - one per tool call: `{"mcp":"<tool>","query":"<query>"}`.

  The server is stateless and MCP sends `clientInfo` only with `initialize`, so tool-call lines don't carry the client name. No IPs, headers (including `user-agent`) or other request data are logged. When `UMAMI_WEBSITE_ID` is set (a separate Umami website, not a secret; optional `UMAMI_HOST`), the same counts are also sent as events `mcp_initialize` (`client`, `version`) and `mcp_tool` (`tool`, `query` trimmed to 200 characters, `found`) so the pilot review has running totals; the payload has no IP and no request headers, and a failed send never changes the answer.
- **Caching:** the index and markdown are fetched from the same deployment and cached per instance for 5 minutes. `MCP_CONTENT_ORIGIN` (optional, not a secret) points the server at another origin.

## Code and tests

- `site/api/mcp.ts`: the Vercel function, routed from `/mcp` in `site/vercel.json`.
- `site/api/_lib/mcp.ts`: tools, search, rate limit and HTTP handling (official `@modelcontextprotocol/sdk`).
- `npm run test:mcp`: offline tests with fixture content.
