# Launch Checklist

A one-pass setup list for standing up the Ikigai Collective Discord. Work through top to bottom. The first few steps matter most — everything else can be adjusted after launch.

## 0. Decide before starting

- [ ] Name of the server (e.g. "Ikigai Collective").
- [ ] Server icon and banner (brand assets from ikigaicollective.org).
- [ ] List of 2–3 founding admins + 2–3 initial moderators.
- [ ] Trimmed channel list for launch — pick a subset of `channels.md`, don't ship all 50+ channels on day one.

## 1. Server scaffolding

- [ ] Create the server. Enable **Community Server** in settings (unlocks Stage channels, Announcement channels, the Onboarding flow, Welcome Screen).
- [ ] Set the server icon and banner.
- [ ] Configure **verification level** to at least "Medium" (verified email + 5-minute account age).
- [ ] Turn on **2FA requirement for moderation**.
- [ ] Set content filter to "Scan messages from all members."

## 2. Roles

Create in order, top of list to bottom (Discord honors list order for permission overrides):

- [ ] `@Founder`, `@Admin`, `@Moderator`, `@Bot`
- [ ] `@Member`, `@Guest`
- [ ] Functional: `@Studio Host`, `@Event Facilitator`, `@Mentor`, `@Onboarding Buddy`
- [ ] Self-assignable: stage-in-loop (4), domain interests (~12), tool stacks, time zones (3), notification pings
- [ ] Verify `@everyone` has minimal perms — view only `#read-me-first`, `#server-guide`, `#introductions`
- [ ] Verify `@Member` has the default posting permissions
- [ ] Color each role per the palette note in `roles.md`

## 3. Channel tree

Launch with the trimmed version — expand later.

**Minimum viable channel set:**

- [ ] `🏛️ Welcome & Orientation`: `#read-me-first`, `#server-guide`, `#introductions`, `#role-picker`
- [ ] `📣 Signal`: `#announcements`, `#community-ops`
- [ ] `🧭 The Loop`: `#design`, `#implement`, `#measure`, `#iterate` (forum channels)
- [ ] `📓 Lab Notes`: `#lab-notes` (forum), `#showcase`, `#seeking-feedback`
- [ ] `🤝 Collaboration`: `#pair-with-me`, `#help-desk`, `#tool-swap`
- [ ] `🎙️ Live`: `Open Studio` (voice), `Lab Night` (stage)
- [ ] `🧠 Domains`: 3–4 domains that match the initial membership
- [ ] `💬 Lounge`: `#water-cooler`
- [ ] `🔒 Admin`: `#admin-chat`, `#mod-chat`, `#audit-log`, `#bot-commands` (private to admins/mods)

- [ ] Set channel-level permission overrides — `@Guest` cannot post outside `#introductions`.
- [ ] For forum channels, pre-create tags (domain tags, status tags).

## 4. Onboarding flow

- [ ] Set up **Welcome Screen** (Server Settings → Welcome Screen): 3 channels highlighted (`#read-me-first`, `#introductions`, `#role-picker`).
- [ ] Set up **Onboarding** (Server Settings → Onboarding): default channels + 2–3 questions to assign time zone, domain interests, stage-in-loop.
- [ ] Write `#read-me-first` from [`templates/rules-channel.md`](./templates/rules-channel.md). Pin. Enable reaction-role agreement if using Option A.
- [ ] Write `#server-guide` post: map of the server, explanation of The Loop.
- [ ] Set up reaction roles in `#role-picker` via Carl-bot / Dyno.
- [ ] Prepare welcome DM template from [`templates/welcome-message.md`](./templates/welcome-message.md). Configure bot to send on join.

## 5. Bots

- [ ] Add the moderation bot (Carl-bot or Dyno). Configure logging to `#audit-log`.
- [ ] Add the events bot (Sesh or Apollo). Test scheduling a dummy event.
- [ ] Install the GitHub App for Discord. Run `/github subscribe` in `#github-activity` against the Collective's org.
- [ ] (Optional) Add Statbot for analytics.
- [ ] Document each bot's owner in a pinned message in `#admin-chat`.

## 6. First content

A server with empty channels looks abandoned. Seed it before inviting members.

- [ ] Founder posts a welcome message in `#announcements`.
- [ ] Founding members post their own intros in `#introductions`.
- [ ] At least one sample post per Loop channel (`#design`, `#implement`, `#measure`, `#iterate`) so new arrivals see the format.
- [ ] At least one sample post in `#lab-notes` using the lab-note template.
- [ ] Pin the server guide, the rules, and the first-24-hours checklist.

## 7. Soft launch

- [ ] Invite founding members only (small group, <20 people).
- [ ] Run one `Lab Night` as a dress rehearsal.
- [ ] Ask for blunt feedback in `#community-ops`.
- [ ] Adjust channels, roles, wording.

## 8. Open to the Collective

- [ ] Send invitation links to the full invited membership.
- [ ] Stagger invites over 1–2 weeks so onboarding buddies can actually greet each person.
- [ ] Host a "this is what this place is" live intro session at the end of week 1.

## 9. Ongoing

- [ ] Weekly: check `#audit-log` and `#mod-inbox`. Rotate `Lab Night` host.
- [ ] Monthly: review channel activity. Archive or consolidate dormant channels.
- [ ] Quarterly: Community Ops Town Hall. Role prune. Bot review.

## Troubleshooting common stumbles

- **Channels go quiet.** Consolidate. A smaller, denser server feels better than a sprawling empty one.
- **New members lurk.** Strengthen the first-24-hours prompt. Assign onboarding buddies.
- **Lab Night attendance drops.** Rotate hosts, change the time slot, or let it pause for a season.
- **Bot permission incidents.** Audit Administrator-level bots quarterly. Prefer narrowly scoped bots.
- **Tone drift toward self-promotion.** Re-anchor the guidelines. "Show your work" is not "promote your work."
