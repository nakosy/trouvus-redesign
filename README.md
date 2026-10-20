# Trouvus website

The redesigned Trouvus site is a static [Astro](https://astro.build/) project focused on enterprise AI transformation strategy and implementation. It includes reusable layouts, animated canvas/SVG visuals, an editorial content collection, legal and responsible-AI pages, SEO metadata, and automated quality checks.

## Local development

Requires Node.js 22 or later.

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm test
```

Netlify production verification:

```bash
npm run test:netlify
```

Netlify uses `netlify.toml` with `npm run build:netlify`, publishes `dist/`, creates deploy previews for pull requests, and sets `PUBLIC_SITE_ENV=production` only for the production context. See `docs/NETLIFY-MIGRATION.md` for the cutover and DNS-preservation plan.

This runs Astro type checking, a static production build, and an internal-link/metadata audit. Use `npm run preview` to review the production build locally.

## Site structure

- `src/components/` — shared header, footer, hero and CTA components
- `src/layouts/` — base and long-form article layouts
- `src/pages/` — routes, legal pages and the insights index
- `src/content/insights/` — Markdown/MDX insight articles
- `src/styles/global.css` — design tokens, responsive layouts and motion rules
- `public/images/` — logos, diagrams and animated SVG visuals
- `src/client/site.js` — source for progressive interactions and lightweight canvas visuals
- `public/scripts/site.js` — generated, minified browser bundle
- `legacy-prototype/` — archived first HTML prototype for reference

## Add an article

1. Duplicate an existing file in `src/content/insights/`.
2. Rename it with the desired URL slug, for example `governing-agentic-ai.md`.
3. Complete every frontmatter field. Keep `draft: true` until it is ready.
4. Add a meaningful editorial visual to `public/images/` and set both `visual` and `visualAlt`.
5. Structure the article with one clear argument, an executive summary, descriptive `h2` sections, in-article diagrams where useful, and source links for material factual claims.
6. Run `npm test`, then review the article at `/insights/<slug>/`.

The collection schema in `src/content.config.ts` validates metadata at build time. Articles automatically receive a hero, reading metadata, visual, table of contents, Article structured data and CTA.

## Preview and production SEO

Preview builds are `noindex, nofollow` by default and `robots.txt` disallows crawling. Set the environment variable below only for the public production deployment:

```text
PUBLIC_SITE_ENV=production
```

The canonical production origin is configured as `https://www.trouvus.com` in `astro.config.mjs`.

## Vercel deployment

Vercel detects Astro automatically. For a confidential review deployment:

1. Deploy a non-production branch such as `preview/astro-redesign`.
2. Keep `PUBLIC_SITE_ENV` unset or set it to `preview`.
3. In Vercel **Project settings → Deployment Protection**, enable **Vercel Authentication** for preview deployments.
4. Invite reviewers or create a shareable protected link.
5. Do not promote to the production domain until the form endpoint, final legal text, approved credential references and analytics consent model are ready.

`vercel.json` supplies legacy-route redirects, security headers and static asset caching.

## Pre-launch decisions

- Replace the preview `mailto:` consultation flow with a consent-aware CRM/form endpoint.
- Have counsel approve Privacy and Terms.
- Add analytics only after choosing a privacy and consent model.
- Publish any historical engagement evidence only with documented attribution and permission.
- Re-run accessibility, responsive visual and performance audits before production promotion.

## Brand system

- Indigo `#5B46F6` — primary brand and interaction accent
- Green `#2F8F63` — evidence, progress and capability accent
- Amber `#FFB800` — emphasis and decision points
- Slate `#0B0F17` — high-contrast hero and footer foundation

The royal-blue legacy mark has been normalized to indigo while retaining Trouvus green as a secondary brand signal.
