# Bots & Integrations

Keep the bot roster small. Every bot is attack surface, maintenance burden, and visual noise. Start with the minimum needed to make the server livable and add only when a specific gap appears.

## Core stack (recommended)

### Moderation & reaction roles

Pick **one**:

- **Carl-bot** — mature, reliable reaction roles, auto-mod, logging, reminders. Strong default.
- **Dyno** — similar feature set, slightly lighter UI.
- **MEE6** — widely used but its leveling system can reintroduce status signaling, which conflicts with the flat-by-default ethos. Either disable XP entirely or avoid.

Used for: reaction roles in `#role-picker`, auto-mod on `#announcements`, logging joins/leaves/role changes into `#audit-log`.

### Events & scheduling

Pick **one**:

- **Sesh** — clean UX, handles time zones well, supports RSVPs, polls, reminders. Recommended.
- **Apollo** — similar, slightly more configuration.

Used for: `Lab Night` weekly event, office hours, co-working sprints, AMA sign-ups. Feeds `#events-calendar`.

### GitHub integration

The Collective connects members via GitHub, so surface that activity in Discord.

- **GitHub App for Discord** (official) — subscribe channels to repos with `/github subscribe owner/repo`. Posts commits, PRs, releases, issues.

Configuration suggestion:
- `#github-activity` — subscribes to the Collective's main org, filtered to releases + PRs merged to main (not every commit).
- Per-project channels — subscribe only to that project's repo, events scoped by what the owner cares about (PRs, issues, releases).
- Use `/github subscribe ... --events releases,pulls,issues` to filter noise.

### Analytics

- **Statbot** (statbot.net) — channel activity, member growth, retention. Useful once the community is large enough that intuition stops working (~100+ members).

## Optional additions

Add only when the need is concrete.

### AI helper bot

Since the Collective is AI-first, an in-server AI assistant fits the ethos. Options:

- **Claude for Discord** (if/when available as a first-party integration) — natural fit.
- **Self-hosted bot wrapping the Claude API** — more flexible, requires ops. Could offer `/ask`, `/summarize-thread`, `/help-find-collaborator`.
- **Community-built bots** — several exist; vet each for privacy (what does it log?) before adding.

Scoping suggestion: limit the AI bot to a single `#ai-assistant` channel initially. Expand only if it proves useful.

### Voice co-working

- **Lofi Radio / Chillhop bots** — ambient music in `Open Studio` or `Focused Sprint`. Optional, easy to remove if it's more friction than benefit.

### Forms / applications

- **Tally** or **Typeform** — if invitation requests come through a form, webhook the submissions into `#mod-inbox`.

### Transcription / summarization

- **Cleanvoice / tldv / Otter** — for recording and transcribing `Lab Night` and AMAs, then posting to `#ama-archive`. Check consent before enabling on any stage.

## Integrations to avoid (by default)

- **Leveling / XP bots.** Conflict with flat structure. Use recognition roles sparingly if at all.
- **Announcement cross-post bots.** Keep `#announcements` human-written.
- **AI auto-reply bots** that respond to every message. Noise. Scope AI to explicit invocation.

## Bot permissions checklist

For any bot added to the server, before clicking "Authorize":

- Does it ask for Administrator? If yes, is that documented as required? If not, decline and find an alternative.
- Can it be scoped to specific channels via role + channel overrides? Prefer that over server-wide.
- What does it log externally? Read the privacy policy. Summarize it in a pinned message in `#admin-chat`.
- Who on the team owns this bot's configuration? One named person per bot.

## Webhooks

Webhooks are simpler and safer than full bots when you only need one-way posting. Use for:

- GitHub org-level activity → `#github-activity`
- Calendar updates → `#events-calendar`
- External service alerts (only if the Collective runs infrastructure that members care about)

## Self-hosted integrations worth considering

Given the Collective's AI-native disposition, lightweight custom automations make sense:

- **Auto-welcome DM** with the first-24-hours checklist — small script via Discord's gateway API.
- **Weekly digest** — a script that summarizes the week's `#lab-notes`, `#showcase`, and `#measure` posts and drops it in `#announcements` on Monday.
- **GitHub profile sync** — on join, prompt the member for their GitHub handle and post a link alongside their intro.

These are the kinds of small automations that the Collective's members are probably the right people to build — consider opening them as projects in a dedicated `#server-ops` thread.
