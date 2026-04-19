# Ikigai Collective — Discord Setup

This subfolder holds the scaffolding, conventions, and working documents for the Discord server that supports the [Ikigai Collective](https://ikigaicollective.org/) community.

## Server purpose

Ikigai Collective is an invitation-only, AI-powered studio for members designing their ikigai — the intersection of what you love, what you're good at, what the world needs, and what you can be paid for. Members use AI tools to compress experimentation cycles and share their work openly through profiles, projects, and lab notes.

The Discord is the real-time nervous system of that studio. It should feel like walking into a well-lit workshop where people are quietly making things, occasionally calling each other over to look at something, and happy to pull up a stool when you arrive.

## Design principles

The server's structure is shaped by a few choices derived from the Collective's stated values:

- **Flat by default.** No status ladders. Functional roles exist only to help people find each other and to keep the space healthy, not to rank members.
- **Structured around the loop.** The four-step experimentation model (Design, Implement, Measure, Iterate) is not just philosophy — it's a literal channel category. Members post where they are in their own loop.
- **Lab notes are first-class.** Long-form, threaded, searchable. Not buried under casual chatter.
- **AI + human balance.** AI tooling is welcomed and visible, but live voice/stage spaces exist to keep the human connection weighted equally.
- **GitHub-native.** Project channels are tied to repos. Code work is visible alongside the writing, building, and making.
- **Low-friction invitation flow.** Invitation-only means a proper greeting matters. Onboarding should feel like being welcomed into someone's studio, not processed at a security desk.

## Status

**Live.** Provisioned 2026-04-17 via `scripts/provision.mjs --guild ikigai-collective --apply`. See the workspace-level [`README.md`](../README.md) for the toolchain and [`exports/ikigai-collective-gaps.md`](../exports/ikigai-collective-gaps.md) for the short list of manual followups (role hierarchy drag, MFA toggle, reaction-role listener, orphan-channel cleanup).

## What's in this folder

- [`spec.yaml`](./spec.yaml) — **machine-readable source of truth.** Describes roles, categories, channels, permission overwrites, onboarding prompts, welcome screen, content templates, and scheduled events. Hand-edit and re-run `node scripts/provision.mjs --guild ikigai-collective --plan` to see the diff.
- [`roles.md`](./roles.md) — human rationale for the role palette (narrative that informed `spec.yaml:roles`)
- [`channels.md`](./channels.md) — full channel tree, grouped by category, with purpose for each (the MVP in `spec.yaml` is a trimmed subset)
- [`onboarding-and-rules.md`](./onboarding-and-rules.md) — invitation flow, rules gate, community norms
- [`bots-and-integrations.md`](./bots-and-integrations.md) — recommended bots, GitHub integration, AI helpers
- [`events-and-rituals.md`](./events-and-rituals.md) — recurring cadences that make the server feel alive
- [`launch-checklist.md`](./launch-checklist.md) — original step-by-step setup (superseded by `spec.yaml` + the provisioner for the structural pass; still useful for the human context)
- [`templates/`](./templates/) — pinned content bodies: `rules-channel.md`, `welcome-message.md`, `lab-note.md`, `server-guide-map.md`, `server-guide-howto.md`

## How to use this scaffolding

The markdown files are the source of truth for *intent*. `spec.yaml` is the machine-readable contract. The live Discord guild is the source of truth for *state* — the provisioner makes state match the contract.

Editing flow:

1. Decide what to change in plain English (e.g., "add a `#design-reviews` text channel under Collaboration").
2. Edit `spec.yaml` accordingly (and update the matching narrative in `channels.md` / `roles.md` / etc. for future humans).
3. `node scripts/provision.mjs --guild ikigai-collective --plan` → review the diff.
4. `node scripts/provision.mjs --guild ikigai-collective --apply --confirm ikigai-collective`.
5. If the change involves pinned content, add/edit a template under `templates/` and reference it in `spec.yaml:content`, then `node scripts/post-content.mjs --guild ikigai-collective --apply`.
