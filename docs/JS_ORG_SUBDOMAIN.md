# Claiming `aweinbox.js.org`

`.js.org` runs a community DNS list for JavaScript / Node projects, mapped to
a CNAME target. This file documents the steps to claim `aweinbox.js.org` for
this site and bind it to the existing Vercel deployment.

## 1. Open the PR against js-org/js.org

1. Fork <https://github.com/js-org/js.org>
2. In your fork, edit **`cnames_active.js`**
3. Add this line in alphabetical position (the file is sorted; `aweinbox`
   sits between `aurelia` and `awesome-...` if those exist):

   ```js
     "aweinbox": "cname.vercel-dns.com", // noCF
   ```

   - The `// noCF` tag tells js.org to skip Cloudflare proxying so Vercel's
     TLS cert is served directly. This is the convention for Vercel-hosted
     sites and matches the other `cname.vercel-dns.com` entries in the file.

4. Commit with a clear message: `Add aweinbox.js.org`.
5. Open a PR against `js-org/js.org` `main` branch. Use this body
   (review by the maintainers focuses on: does the project exist, is it
   JS-related, is the repo public):

   ```markdown
   ## Project information

   - **Subdomain**: `aweinbox`
   - **Target**: `cname.vercel-dns.com` (Vercel)
   - **Repository**: https://github.com/6838073738-ai/awe-inbox
   - **Current URL**: https://awe-inbox.vercel.app

   ## Description

   Awe Inbox is a contemplative single-page web experience built with
   Next.js, React, and Three.js. It renders a 3D Earth with NASA EONET
   natural-event markers, country borders, a solar-system view with
   spacetime-curvature visualisation, and country/planet detail pages.
   Stack: Next.js 16, React 19, TypeScript strict, Three.js, Tailwind 4.

   No analytics, no third-party scripts, full CSP / HSTS / Permissions-
   Policy lockdown. RFC 9116 `/.well-known/security.txt` published.
   ```

6. Wait for review (typically 1-7 days; sometimes longer at volume).

## 2. After the PR merges

The js.org maintainers will configure DNS automatically. To complete the
Vercel side:

1. Vercel dashboard → **Project: awe-inbox** → **Settings** → **Domains**.
2. Click **Add**, enter `aweinbox.js.org`, confirm.
3. Vercel will detect the CNAME, validate it points to `cname.vercel-dns.com`,
   and issue a Let's Encrypt TLS cert (usually within 1-2 minutes).
4. Once green, also click **Add** → enter `www.aweinbox.js.org` as a
   *redirect* to the apex if you want both spellings to work.
5. Set `aweinbox.js.org` as the **primary domain** so all `awe-inbox.vercel.app`
   traffic 308-redirects to the new domain.

## 3. After the new domain is live, update the code

In the same commit, update these to reference the new canonical URL:

- `app/layout.tsx` — `NEXT_PUBLIC_SITE_URL` env fallback, currently
  `https://aweinbox.example`
- `public/.well-known/security.txt` — `Canonical:` and `Policy:` lines
- `README.md` — header link
- `app/sitemap.ts` and `app/robots.ts` if they hard-code the host

Submit https://aweinbox.js.org to <https://hstspreload.org> once it's been
live and stable on HTTPS for a week — this opts you into the browser-shipped
HSTS preload list, the strongest form of downgrade-attack protection.
