# Dark Ink

Static portfolio site for **Dark Ink** — a sole proprietorship offering cloud automation consulting and live streaming.

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

No build tooling required — open `index.html` directly in a browser or serve with any static file server:

```bash
npx serve .
# or
python -m http.server 8080
```

## Deployment

Hosted via GitHub Pages. Any push to `main` updates the live site.

To enable: **Settings → Pages → Branch: `main`, folder: `/ (root)`**

Live URL: `https://sampouls.github.io/dark-ink`

## Customization checklist

- [ ] Replace `darkink` Twitch handle with real channel slug
- [ ] Update contact emails (`hello@darkink.co`)
- [ ] Swap clip card placeholders with Twitch API thumbnails or embeds
- [ ] Update GitHub / LinkedIn slugs in footer and contact section
- [ ] Confirm measurements in About cards if surfaced elsewhere

