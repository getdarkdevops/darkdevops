# DarkDevOps

Static portfolio site for **DarkDevOps** ([darkdevops.com](https://darkdevops.com)) — a sole proprietorship offering GCP automation consulting.

## Stack

- Pure HTML, CSS, and vanilla JS — no frameworks, no build step
- [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- SVG grain texture overlay, CSS custom properties, IntersectionObserver scroll animations

## Sections

| Section | Description |
|---|---|
| Hero | Full-viewport wordmark with staggered entrance animations |
| Services | Two-card overview (Consulting, Streaming) |
| Automation Consulting | Positioning, use cases, tech stack, CTA |
| Streaming | Twitch live indicator, clip cards, follow CTA |
| About | Bio, background cards (IT/ops, Economics, ZX-6R) |
| Contact | Form with subject routing, social links |

## Local development

The site itself is plain HTML/CSS/JS — open `index.html` directly for quick visual work.

To exercise the contact form locally you need the Worker running:

```bash
npm install
npm run dev      # wrangler dev — serves the site + /api/contact
```

## Contact form

`POST /api/contact` is handled by `src/worker.js`, which emails submissions to
`CONTACT_TO` via Cloudflare **Email Routing** (the `send_email` binding) — no
third-party service and no API keys.

One-time setup in the Cloudflare dashboard before the form will deliver:

1. Add `darkdevops.com` to this Cloudflare account (so `noreply@darkdevops.com`
   is a valid sender).
2. **Email → Email Routing → Destination addresses**: add and **verify**
   `sales@darkdevops.com` (must match `destination_address` in `wrangler.jsonc`
   and `CONTACT_TO`).

   Verification is **per Cloudflare account** and does not survive moving the zone
   to a different account. An unverified destination makes `send_email` throw, and
   every valid submission returns `502 Could not send right now` — the form looks
   broken with no other symptom. Re-verify after any account migration.

Spam protection: a hidden `company` honeypot field; submissions that fill it are
silently accepted but not emailed.

## Deployment

```bash
npm run deploy   # wrangler deploy
```

Deploys the static assets + Worker together. `.assetsignore` keeps source,
config, and `node_modules` out of the published asset bundle.

## Customization checklist

- [ ] Replace `darkdevops` Twitch handle with real channel slug
- [ ] Update contact emails (`hello@darkdevops.com`)
- [ ] Swap clip card placeholders with Twitch API thumbnails or embeds
- [ ] Update GitHub / LinkedIn slugs in footer and contact section
- [ ] Confirm measurements in About cards if surfaced elsewhere

