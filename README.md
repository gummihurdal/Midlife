# A Magnificent Midlife — Reading Companion

A single self-contained page distilling Kate Muir's *How to Have a Magnificent Midlife Crisis* — the substance of each of the 18 chapters (plus intro and conclusion), organised into the book's three parts (Mind, Body, Spirit), with a few discussion prompts per chapter for reading together.

Same shape as the dragonfly project: one `index.html`, no build step, no external assets beyond Google Fonts.

## Files
- `index.html` — the whole site (fonts loaded from Google Fonts; everything else inline)
- `CNAME` — custom domain for GitHub Pages (`midlife.azurenexus.com`)

## Deploy (GitHub Pages)
1. Create a repo under `gummihurdal` (e.g. `midlife`).
2. Upload `index.html` and `CNAME`.
3. Settings → Pages → Source: `main` / root.
4. Point a CNAME DNS record for `midlife.azurenexus.com` at `gummihurdal.github.io` (Cloudflare).
5. Enable "Enforce HTTPS" once the cert issues.

## Notes
- It's a *companion*, not the book — it deliberately keeps the ideas and leaves the anecdotes behind.
- To change the domain, edit `CNAME` and the matching DNS record.
- Respects reduced-motion; scales down to mobile.
