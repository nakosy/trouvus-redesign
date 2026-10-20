# Trouvus Netlify migration

## Architecture

- **Source:** `nakosy/trouvus-redesign` on GitHub
- **Production branch:** `main`
- **Build command:** `npm run build:netlify`
- **Publish directory:** `dist`
- **Node.js:** 22
- **Canonical production origin:** `https://www.trouvus.com`
- **Continuous deployment:** Netlify GitHub integration deploys each accepted push to `main`; pull requests receive deploy previews.

`netlify.toml` is the source of truth for build settings, production indexing, and legacy redirects. `public/_headers` is the source of truth for security and cache headers.

## Domain and DNS facts captured on October 20, 2026

- Registrar: **GoDaddy**
- Authoritative DNS: **Cloudflare** (`coco.ns.cloudflare.com`, `tim.ns.cloudflare.com`)
- Current web hosting: **Wix**
- Apex A record: `185.230.63.107` (Wix)
- `www` CNAME: `pointing.wixdns.net` (Wix)
- Mail: **Zoho EU**
  - MX 10 `mx.zoho.eu`
  - MX 20 `mx2.zoho.eu`
  - MX 50 `mx3.zoho.eu`
  - SPF `v=spf1 include:zoho.eu ~all`
  - DMARC `v=DMARC1; p=reject;`

The domain itself is not hosted by Wix. Only the website records point to Wix. The lowest-risk cutover is therefore to keep the registrar and Cloudflare DNS unchanged, add `trouvus.com` and `www.trouvus.com` to Netlify, and replace only the Wix A/CNAME records with the values Netlify provides. **Do not change MX, SPF, DKIM, DMARC, or Zoho verification records.**

## Contact form

The Executive AI Value Diagnostic form is declared as a Netlify Form named `executive-ai-value-diagnostic`. After form detection is enabled and the first Netlify build completes, configure a verified submission notification to `info@trouvus.com`. The form keeps a `mailto:` fallback on non-Netlify preview hosts.

## Wix public URL inventory

The Wix sitemap exposed 25 URLs at migration time: 16 pages, four blog posts, one booking page, one blog index, one placeholder product, one placeholder category, and one placeholder resource. Each relevant legacy route is mapped in `netlify.toml` to the closest current Trouvus destination. Placeholder commerce/resource URLs redirect to Insights; Wix case studies redirect to the honestly labeled Perspectives page.

## Cutover sequence

1. Connect the GitHub repository in Netlify and confirm a successful deploy preview.
2. Enable Netlify form detection and deploy again.
3. Add the custom apex and `www` domains in Netlify; keep `www.trouvus.com` primary.
4. Record the exact DNS targets Netlify provides.
5. In Cloudflare, lower the TTL for the current Wix web records.
6. Change only the apex web record and `www` CNAME to Netlify.
7. Wait for Netlify DNS verification and TLS provisioning.
8. Verify `https://www.trouvus.com`, the apex redirect, all key routes, redirects, headers, sitemap, robots, forms, and email delivery.
9. Keep Wix active until validation is complete; cancel it only after any private data/export requirements are resolved.

## Important data limitation

Publicly discoverable Wix content and URLs can be migrated from the live site, but Wix contacts, form submissions, bookings, member records, invoices, and private media libraries are not publicly accessible. Export those records from the Wix dashboard before cancelling Wix if they need to be retained.
