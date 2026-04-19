# Channels

The channel tree is organized around the experience of being a member, not around server admin convenience. A new arrival should be able to read the category names top-to-bottom and understand what this place is for.

Emoji prefixes in channel names are intentional — they act as visual anchors in Discord's sidebar and help categories read at a glance. Substitute to taste.

## Category: 🏛️ Welcome & Orientation

First impression. Read-mostly. Every invited member passes through here.

- `#read-me-first` — mission, community guidelines, how the server is structured. Gated: reacting/agreeing unlocks `@Member`.
- `#server-guide` — a living map: "where do I post what?" Updated as the space evolves.
- `#introductions` — new arrivals share who they are, what they're working on, what they're curious about. Threaded by default.
- `#role-picker` — reaction roles for domains, tools, time zones, notifications.

## Category: 📣 Signal

Low-noise, high-signal. Most members mute everything *except* this.

- `#announcements` — staff-posted only. Server-wide news. Pings `@Announcements`.
- `#community-ops` — meta: structural suggestions, channel proposals, feedback on the server itself.
- `#changelog` — bot-posted record of notable server changes (new channels, role tweaks).

## Category: 🧭 The Loop

The core of the server. Mirrors the Collective's four-step experimentation model. Members post where they are in their own loop — the categorization teaches the practice through use.

- `#design` — "What if…?" Hypotheses, sketches, framings, things you're considering trying.
- `#implement` — "Here's what I'm building." Work-in-progress, screenshots, demos, commits, prototypes.
- `#measure` — "Here's what happened." Metrics, user quotes, test results, honest assessments of outcomes.
- `#iterate` — "Here's what I'm changing." Pivots, re-hypothesizing, course corrections, things abandoned.

Each of these is ideal as a **forum channel** so individual experiments become their own thread and remain findable.

## Category: 📓 Lab Notes

Longer-form reflection and output. Distinct from `#implement` (which is day-to-day build-log) — this is where members publish the distilled version.

- `#lab-notes` — forum channel. One thread per post. Tag by domain. See [`templates/lab-note.md`](./templates/lab-note.md) for a suggested structure.
- `#showcase` — finished-ish output. Launches, published pieces, releases.
- `#seeking-feedback` — explicit critique requests only. Posting here is opt-in to receiving direct response. Keeps feedback consent-based.

## Category: 🤝 Collaboration

Finding each other and helping each other.

- `#pair-with-me` — "I'm looking for a co-builder / collaborator / thought partner on X."
- `#help-desk` — "I'm stuck on Y." Encourages asking early.
- `#tool-swap` — AI tool recommendations, prompt patterns, stack reviews, what's working / not.
- `#opportunities` — curated gigs, grants, residencies, calls for submissions. Posting rules in the pinned message (no unsolicited recruitment).

## Category: 🎙️ Live

The human-connection counterweight to async text. Voice and stage.

- 🔊 `Open Studio` — ambient voice hang. Always on. No agenda. Body-doubling welcome.
- 🔊 `Focused Sprint` — pomodoro co-working. Etiquette: silent unless on break.
- 🔊 `Office Hours` — scheduled drop-ins with whoever is hosting that week.
- 🔊 `Overflow 1` / `Overflow 2` — extra voice rooms for spontaneous conversation.
- 🎤 `Lab Night` (Stage channel) — weekly share-out. Members present what they built / measured / iterated that week. See `events-and-rituals.md`.

## Category: 🧠 Domains

Interest-based rooms. Keep to the same buckets as the domain roles so they map 1:1. These are **forum channels** so active threads don't get buried.

- `#art-design`
- `#code-engineering`
- `#writing-publishing`
- `#music-audio`
- `#film-video`
- `#science-research`
- `#education`
- `#entrepreneurship`
- `#wellness-embodiment`
- `#contemplative`
- `#games-play`
- `#hardware-robotics`

If a domain has <5 regular posters, consider collapsing it into a neighbor to avoid ghost channels. Better to start with fewer and split than start with many and watch them empty.

## Category: 🌱 Resources

Curated, not chat-y. Mostly pinned messages and reference posts.

- `#reading-list` — essays, books, papers the community returns to.
- `#prompts-and-playbooks` — shared prompts, agent configs, workflows.
- `#events-calendar` — upcoming events (bot-synced if using Sesh/Apollo).
- `#ama-archive` — transcripts / recordings of past live sessions.

## Category: 🌐 GitHub

If the Collective has a GitHub org, mirror activity here. Members already use GitHub to connect, so this closes the loop.

- `#github-activity` — webhook-posted: new repos, releases, noteworthy PRs.
- `#project-channels` (parent placeholder) — individual projects can request a dedicated channel with a webhook to their repo. See `bots-and-integrations.md`.

## Category: 💬 Lounge

The kitchen of the studio. Off-topic is fine here — keeps the working channels on-topic.

- `#water-cooler` — general chat.
- `#memes-and-moments` — humor, screenshots, funny bits.
- `#gratitude` — small kindnesses and thanks.
- `#music-mix` — what you're listening to while working.
- `#photo-dump` — walks, desk setups, workshops, making-of shots.

## Category: 🔒 Admin (private)

Hidden from `@Member`. Only `@Founder`, `@Admin`, `@Moderator`.

- `#admin-chat` — admin discussion.
- `#mod-chat` — moderation coordination, reports triage.
- `#bot-commands` — to avoid cluttering member channels with bot invocations.
- `#audit-log` — webhook feed of joins, leaves, bans, role changes. Supplements Discord's built-in audit log for quick scanning.
- `#mod-inbox` — outputs from the `/report` flow.

## Channel count sanity check

As drafted, this is roughly 50 text channels + 5 voice/stage. That's on the higher end for a small-to-medium server. **For launch, start with a trimmed version** — the core Loop, Lab Notes, Welcome, one Lounge, one Live, and 3–4 active Domains — and grow into the full tree as membership fills it out. A ghost-town server of empty channels reads worse than a smaller one that feels inhabited.

## Naming conventions

- Lowercase, hyphenated.
- Emoji prefix used sparingly in category names, selectively in channel names (visual distinctiveness only).
- Avoid cute names that obscure function (`#the-foundry` is less useful than `#implement`).
- Prefer forum channels wherever threads would otherwise dominate (Loop, Domains, Lab Notes).
