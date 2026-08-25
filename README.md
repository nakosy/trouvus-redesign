# Trouvus — static site

Hand-authored HTML. No framework, no build step, no dependencies.

## Layout

    index.html                homepage
    architecture/index.html   → /architecture
    baseline/index.html       → /baseline
    styles.css                the whole design system
    script.js                 all page interaction
    netlify.toml              publish config, security headers, CSP
    _redirects                Wix → Netlify 301 map
    README.md                 this file

Pages are directory-index files so URLs stay clean without relying on
Netlify's Pretty URLs toggle. Remaining pages follow the same shape:

    systems/index.html        → /systems
    systems/mios/index.html   → /systems/mios

**`/baseline` is an addition to the change order's §4 inventory.** The 30-day
baseline sprint was previously only a CTA band on the homepage; it is the entry
engagement and the commercial front door, so it has its own page. Rename the
route in one place (nav, footer, and the two CTA bands) if you prefer another.

## Design system

All colour, type and spacing live in the `:root` token block at the top of
`styles.css`. Every page links it; no page carries its own styles.

Three theme states are supported and all three must keep working:

- `data-theme="light"` — explicit light
- `data-theme="dark"` — explicit dark
- **unstamped** — the default, resolved by `prefers-color-scheme`

Never declare a colour whose only definition sits inside a media or
`[data-theme]` block. That is the classic unreadable-page bug.

## Interaction

One shared `script.js`, no libraries. Every module is guarded by the presence of
its own markup, so the same file serves every page and does nothing on pages
that lack the element:

- **The decision chain** (homepage) — steppable one node at a time, or run end
  to end. Switching to the corrupted feed halts the chain at gate 02 and emits
  BLOCKED.
- **The label set** (homepage) — toggles between verified and unverifiable.
- **The cost curves** (homepage) — draw once on scroll, then rest.
- **The Leap and the Grid** (`/baseline`) — drift the governance boundary and
  the protected column is absorbed into the offload region.
- **Principle tracing** (`/architecture`) — click a principle, or walk all six,
  to trace each to what it becomes in a Trouvus system.

## Diagram grammar

Framework diagrams follow one grammar, defined in `styles.css` under
*framework diagram grammar*: containment blocks for things that are one thing,
two-tier labels (name plus role), mono uppercase captions above each region,
labelled connectors, square corners, hairline rules, no shadows. Accent marks
the element at stake — a drifted boundary, a failed gate, a Trouvus addition —
and never decorates. Add diagrams by reusing these classes, not by inventing
new marks.

`prefers-reduced-motion: reduce` renders every final state without animating.

## Open items

Search the source for `TODO(mitt):`. Current list:

1. Octopus Protocol needs a stable public URL before `/architecture` can link.
2. TAKE 2026 keynote needs a slides or abstract link.
3. Case study link for the industrial-holding programme.
4. Confirm phone and email — both carried over from the Wix site, unverified.
5. Audit the Wix sitemap and complete `_redirects` before the DNS switch.
6. Decide the fate of the July 2024 blog post.

## Claims discipline

Every factual claim on the page carries a source marker resolving to the Sources
block. Do not add a claim without one. Specifically absent, deliberately:
client names, countries, regions, revenue, growth, team size, citation counts,
publication counts, agent counts, testimonials.

The evidence section attributes the executive programme to the principal,
delivered through the CCAIE Foundation — which is what actually happened.
