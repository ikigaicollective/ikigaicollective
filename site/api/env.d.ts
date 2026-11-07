// Env vars the api/ functions read. Optional: each is unset in preview or locally.
declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_SITE_ENV?: string;
    TURNSTILE_SECRET?: string;
    SUBSTACK_FEED_URL?: string;
    CRON_SECRET?: string;
    GITHUB_REPO?: string;
    GITHUB_BRANCH?: string;
    GITHUB_CONTENT_TOKEN?: string;
    DISCORD_BOT_TOKEN?: string;
    DISCORD_GUILD_ID?: string;
    DISCORD_LOOP_CHANNEL_ID?: string;
    DISCORD_WEBSITE_TAG_ID?: string;
    MCP_CONTENT_ORIGIN?: string;
    UMAMI_WEBSITE_ID?: string; // non-secret; MCP event counts. Unset = no events.
    UMAMI_HOST?: string; // optional collector origin, default https://gateway.umami.is
  }
}
