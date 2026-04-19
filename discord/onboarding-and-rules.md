# Onboarding & Rules

The Collective is invitation-only, so onboarding is about welcome and orientation, not gatekeeping. The rules gate exists to make community norms explicit, not to create friction.

## Invitation flow

1. A prospective member is invited off-platform (website form, referral, etc.).
2. They receive a single-use or short-TTL invite link to Discord.
3. On join, Discord's community verification assigns `@Guest` by default (or `@Member` directly — see the two options below).
4. They land in `#read-me-first`. A pinned message explains how to unlock the server.

### Two options for the rules gate

**Option A — Reaction-role agreement (lower friction).** New arrival reacts to the pinned rules post with a specific emoji. Bot auto-grants `@Member`. Good for small, high-trust, invite-only communities.

**Option B — Onboarding questionnaire (slightly more friction, more signal).** Discord's built-in Onboarding feature (Server Settings → Onboarding) asks a few questions: time zone, domains of interest, current stage in the loop. Answers auto-assign self-assignable roles. This also serves as a light "are you who we invited?" check.

Recommendation: **Option B**. It doubles as role-picker for new members and saves them a trip to `#role-picker` later. Keep questionnaire short (under 2 minutes).

## First 24 hours — what new members should do

Surfaced in a welcome DM from the `@Onboarding Buddy` or a bot:

1. Post in `#introductions` — who you are, what you're exploring, what you're good at, what you're curious about.
2. Pick any additional roles in `#role-picker`.
3. Drop one thing into `#design`, `#implement`, `#measure`, or `#iterate` — wherever you currently are in your loop. Not a debut. Just a note.
4. Read the latest `#lab-notes` thread and leave a reply on one that resonates.

This sequence is deliberate: it establishes the *practice* of the studio (posting where you are in the loop) from day one, rather than leaving the new member to lurk indefinitely.

## Community guidelines

Short, quotable, and compatible with the Collective's stated values. These live in `#read-me-first` — see [`templates/rules-channel.md`](./templates/rules-channel.md) for a copy-paste version.

1. **Show your work.** Process is welcome here. Unfinished counts. Polish is optional.
2. **Share generously, credit openly.** If someone's prompt, approach, or feedback shaped your work, say so.
3. **Curiosity over posturing.** This is a studio, not a stage. No status games.
4. **Feedback is consent-based.** Critique is invited, not imposed. Post in `#seeking-feedback` when you want direct response.
5. **Disclose substantial AI authorship.** When AI did most of the writing, building, or deciding, say so. No shame — just clarity.
6. **Respect time zones.** Use `@Announcements` sparingly. Don't `@everyone`. Schedule live events at varied hours.
7. **No unsolicited pitches.** Don't DM members recruitment offers, sales, or pitches unless they've said they're open to it.
8. **Keep it human.** Be kind. Assume good faith. Take the conversation to DM if it's getting heated in public.
9. **Privacy.** What's shared in the server stays in the server unless the author says otherwise.
10. **Safety valves.** If something is off, tag `@Moderator` or use `/report`. We take reports seriously and confidentially.

## Moderation philosophy

- **Minimal visible moderation.** The goal is not policing — it's maintaining the conditions for a studio to exist.
- **Conversation first.** Mods reach out in DM before taking action, unless content is clearly harmful (harassment, doxxing, spam).
- **Three-step escalation.** Private DM → formal warning logged in `#mod-chat` → temporary timeout → removal. Skip to removal for severe cases.
- **Mod rotation.** Volunteer moderators serve 3–6 month terms. Prevents burnout and keeps the role service-shaped rather than status-shaped.
- **No secret rules.** Anything that would get a member actioned must be visible in `#read-me-first`. If a new pattern emerges that needs addressing, update the rules first and announce the update.

## Departure

- When a member leaves, `@Moderator` posts a short, neutral note in `#audit-log` (bot-automated).
- No public callout for quiet exits. People come and go.
- Permanent removals (for cause) are announced briefly in `#community-ops` with no specifics, so the community knows the space has been maintained without turning it into drama.

## Incident playbook (brief)

For mods. Full version lives in a private doc pinned in `#mod-chat`.

- **Spam / phishing.** Delete, ban the account, scan for other affected channels.
- **Harassment report.** DM the reporter within 24h. Review context. Contact the reported party in DM. Decide together with at least one other mod.
- **Doxxing.** Immediate delete + timeout. Preserve evidence via screenshot. Review with admins.
- **Bot compromise.** Revoke the bot's token, remove from server, notify admins, post in `#changelog` once resolved.
