# Ashira Tantra — private sessions

A complete HTML, CSS and JavaScript editorial site for private Tantra sessions in Philadelphia. The build uses the owner's supplied copy verbatim, original Meno Banner / Archivo Narrow font references and goddess mark, and the supplied practice films. The existing Ashira and O-Circle pages and the actual Pinterest board informed the color and composition; the rejected circle-art hero is no longer used.

## Run the actual site

```sh
npm run dev
```

Open `http://localhost:3000/`. The server also supports `/private-tantra-sessions-philadelphia/` and its relative assets. Node.js 22 or newer is sufficient to run it; GSAP 3.15.0 and ScrollTrigger are vendored locally. `npm ci` restores the pinned package when updating those browser files.

```sh
npm run build
```

`dist/` contains the static site. The Node server sends `X-Robots-Tag: noindex, nofollow` by default because it is a review server. If intentionally serving production through Node, set `NODE_ENV=production`. A static production host serves the contents of `dist/` directly.

## Portable HTML preview

```sh
npm run preview:single
```

This creates `artifacts/ashira-preview.html`, approximately 22.6 MB. CSS, JavaScript, images and videos are embedded, so adjacent folders are unnecessary. Original licensed font faces still load from their original providers and need an internet connection. The modular static site is preferable for hosting: its opening practice video is only 177 KB and full films load on request.

## Copy and design

- `content/private-sessions.md` is the supplied approved copy.
- `scripts/rebuild-page.py` generates the complete semantic HTML from that copy using Python 3's standard library. Run `python3 scripts/rebuild-page.py` after intentional content changes.
- `public/styles.css` covers the global system and upper chapters; `public/journey.css` covers the remaining chapters.
- `public/script.js` preserves keyboard-operable session tabs, audience and membership choices, menus and native video/inquiry dialogs.
- `public/motion.js` provides GSAP entrances, a restrained image parallax, process-row emphasis and viewport-aware sensory-film playback. Global pause and reduced-motion preferences apply to both animation and video.

## Booking remains a separate build

`public/site-config.js` contains optional verified public HTTPS destinations for a conversation, session, membership and referral. They are currently blank, as requested. The inquiry dialog explains that online scheduling is coming soon and that no booking has been submitted. This site does not transmit inquiries or collect payments.

## Hosting / Lovable handoff

The user hosts with Lovable. This HTML version is for reviewing the actual design before integration into that project; no Lovable or production-site change has been made. The intended final route remains:

`https://www.ashiratantra.com/private-tantra-sessions-philadelphia/`

Preserve relative asset paths when integrating. If the route changes, update the canonical URL, social URLs and structured-data URLs in the generator before rebuilding. Metadata includes the Philadelphia service, accurate single/monthly/twice-monthly offers, and the actual FAQ content. No street address or phone number has been invented.

## Media

`ashira-film.mp4` and `breath-practice.mp4` are the two successfully downloaded supplied videos. The practice and sensory loops/posters are derived from them and retain their source colors. The larger supplied MOV exceeded the uploaded-file download tool's 32 MiB limit and is not included. The original font providers and asset ownership remain unchanged.
