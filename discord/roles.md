# Roles

Roles are split into three layers: **standard** (every Discord server needs these), **functional** (light operational roles people volunteer into), and **self-assignable** (identity/interest tags members pick themselves via reaction roles or a bot).

Because the Collective is explicitly flat, no role should read as "higher status." Functional roles are framed as service, not rank.

## Standard roles

These are the baseline moderation and access layers. Order in Discord's role list determines hierarchy for permission overrides — put them in this order, top to bottom.

| Role | Purpose | Permissions sketch |
|---|---|---|
| `@Founder` | Server owner + 1–2 trusted admins. Holds the keys. | Administrator |
| `@Admin` | Trusted stewards who can change server settings, roles, channels. | Manage Server, Manage Roles, Manage Channels, Ban |
| `@Moderator` | Keeps conversation healthy. Handles reports. | Kick, Timeout, Manage Messages, Manage Threads |
| `@Bot` | Assigned to bots only. | As required per integration; never give Administrator to bots unless unavoidable |
| `@Member` | Verified, full-access member. The default after onboarding. | Send messages, create threads, connect to voice, etc. |
| `@Guest` | Pre-verification or short-term visitor (e.g. invited speaker). | Read-only in most channels; can post in `#introductions` only |

## Functional roles (opt-in, service-oriented)

Voluntary roles for members who want to help the space run. Kept deliberately few — more roles would reintroduce hierarchy through the back door.

- **`@Studio Host`** — stewards one category or a recurring ritual (e.g. hosts Lab Night, keeps a domain channel tidy). Light mod abilities in their channel (manage threads, pin messages).
- **`@Event Facilitator`** — runs live sessions, AMAs, co-working sprints. Can start Stage events, schedule via the events bot.
- **`@Mentor`** — members who have explicitly volunteered to take DMs for 1:1 guidance. Opt-in on both sides — listed in a `#mentors` post, not pinged by default.
- **`@Onboarding Buddy`** — greets new arrivals in `#introductions`, answers "how does this place work" questions. Rotates.

## Self-assignable roles (reaction roles / bot-assigned)

Members pick these themselves in a `#role-picker` channel. These are for **discovery** — they let people find collaborators, not signal credentials.

### Stage in the loop

Mirrors the Collective's four-step model. Members can wear more than one.

- `@Designing` — forming a hypothesis
- `@Implementing` — building / shipping
- `@Measuring` — evaluating outcomes
- `@Iterating` — adjusting course

### Domain interests

Broad buckets. Kept wide so they don't multiply. Members pick as many as apply.

- `@Art & Design`
- `@Code & Engineering`
- `@Writing & Publishing`
- `@Music & Audio`
- `@Film & Video`
- `@Science & Research`
- `@Education & Pedagogy`
- `@Entrepreneurship`
- `@Wellness & Embodiment`
- `@Contemplative Practice`
- `@Games & Play`
- `@Hardware & Robotics`

### Tools & stacks

Helps members find others using the same tools. Prune and add based on what the community actually uses.

- `@Claude`, `@GPT`, `@Gemini`, `@Open-source Models`
- `@Claude Code`, `@Cursor`, `@Replit Agent`
- `@n8n`, `@Zapier`, `@Make`
- `@Notion`, `@Obsidian`, `@Figma`

### Time zone

For scheduling live events and knowing when to ping.

- `@Americas`
- `@EMEA`
- `@APAC`

### Notifications (opt-in pings)

- `@Announcements` — pinged for server-wide news
- `@Lab Night` — pinged when the weekly share-out starts
- `@Co-work` — pinged when an open voice sprint kicks off
- `@Opportunities` — pinged for curated gigs / grants / calls

## Recognition / cohort roles — intentionally omitted

No cohort roles (e.g. `@Cohort-2026-04`, `@Founding Member`) and no activity-based recognition roles (e.g. `@Lab Notes Author`) in the baseline scheme. Both were considered and declined to keep the server maximally flat: cohort markers risk becoming seniority signals, and activity-recognition roles risk becoming status leaderboards, either of which would undercut the "no hierarchy, no assigned tasks" ethos the Collective describes.

Everyone who passes onboarding is `@Member`. That's it.

If the community later decides it wants a way to surface regular lab-note contributors or group a discrete intake wave, it can be added deliberately — but starting without it is easier than removing it later.

## Role color scheme

> **Note.** The palette below is *inferred* from the Ikigai Collective website's aesthetic signals (minimalist, technical-philosophical, "flat by design," numbered 01–04 framework, a Japanese-rooted concept). I couldn't read the site's actual CSS in this session. Treat these hexes as a draft to be corrected once the real brand tokens are confirmed.

### Palette (inferred)

Anchors — these set the overall tone of the role list:

- **Ink** `#1A1A1A` — near-black. The default "serious but not loud" color for standard staff roles.
- **Paper** `#F7F5F0` — warm off-white. Used in Discord usernames only if the role color needs to read as "unmarked" against the dark theme, which rarely happens — keep this as a background reference.
- **Stone** `#8C8A84` — warm neutral grey. Functional roles.

Accent — one primary accent, used sparingly. Two candidates, pick one:

- **Sumi-red** `#B5443A` — warm, earthy, resonates with the Japanese etymology of *ikigai*.
- **Ai-indigo** `#2A3F5F` — deep traditional Japanese indigo; reads as studious and calm.

Loop progression (the four stage-in-loop roles) — adjacent earth tones that read as a cycle, not a ranking:

- `@Designing` — **Clay** `#C8A27A` (warm sand)
- `@Implementing` — **Moss** `#7A8F5C` (muted green)
- `@Measuring` — **Slate** `#6B7A88` (cool grey-blue)
- `@Iterating` — **Terracotta** `#B5754F` (warm earth, loops back toward Clay)

Domain interests — twelve gentle, desaturated hues pulled from the same earth-and-ink family so the role list reads as one palette rather than a rainbow. Keep saturation low. If paring down, use Stone for any domain whose color isn't yet decided.

### Assignment

- Standard staff roles (`@Founder`, `@Admin`, `@Moderator`): **Ink**. Restraint reinforces the flat-by-default ethos — mods shouldn't visually dominate.
- Functional roles (`@Studio Host`, `@Event Facilitator`, `@Mentor`, `@Onboarding Buddy`): **Stone**.
- Stage-in-loop: the four Loop progression colors above.
- Domains: desaturated spectrum.
- Notification and tool-stack roles: no color (Discord's default), since they're utility tags.

The **Accent** (Sumi-red or Ai-indigo) is held in reserve — not assigned to any role in the baseline scheme — so it remains available for a future role if one is ever deliberately added.

### Why restrained

Bright role colors push username bars up the visual hierarchy and start reading as status markers. The palette above is intentionally low-saturation so the channel content stays the foreground.

## Permissions notes

- Default `@everyone` should have very little — push access to `@Member` so the verification gate matters.
- `@Guest` should be able to read `#read-me-first`, `#server-guide`, and post in `#introductions` only.
- Voice channels for member use: `@Member` can connect. Stage channels: `@Event Facilitator` can be a speaker by default.
- Bots get channel-scoped access where possible — never server-wide Administrator unless a specific bot documents that it must have it.
