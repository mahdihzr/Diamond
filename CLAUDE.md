# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, Persian (RTL, `lang="fa"`) digital menu for "Diamond Café" (کافه دیاموند). No build step, no dependencies, no package manager. Deployed with GitHub Pages (legacy build, `main` branch, root `/`) at https://mahdihzr.github.io/Diamond/ — pushing to `main` publishes.

## Running locally

Open `index.html` directly, or serve the folder (needed for nothing in particular, but closer to Pages):

```bash
python -m http.server 8000
```

## Structure

- `menu-data.js` — **the only file to touch for content changes.** Assigns `window.MENU = { config, categories }`.
  - `config`: cafe name, latin name, welcome, tagline, `currency`, and optional footer fields (`note`, `instagram`, `phone`, `address`, `hours`) — empty strings are hidden.
  - `categories[]`: `id`, `title`, `short` (nav chip label), `subtitle`, `icon` (one of `cup`/`tea`/`ice`/`gem`, defined in `ICONS` in `app.js`), `accent` (hex color), `items[]`.
  - item: `name` (Persian), `en`, optional `note`, `price` (`null` = no price shown; accepts number or string with Persian digits/commas), `available` (`false` shows a "ناموجود" badge).
- `assets/app.js` — vanilla ES5 IIFE that renders everything from `window.MENU`: header text, sticky category chips, sections, search, footer. Loaded after `menu-data.js` via plain `<script>` tags.
- `assets/style.css` — all styling; color tokens on `:root`; dark theme only.
- `assets/fonts/` — self-hosted woff2 (Vazirmatn, Lalezar, Playfair Display). Intentionally no Google Fonts/CDNs so it works where those are blocked (Iran).

## Conventions and gotchas

- Keep `app.js` ES5-style (`var`, `function`), matching the existing code; no frameworks or bundlers.
- Menu data is user-editable: build DOM with `textContent` (via the `el()` helper). `innerHTML` is only used for the constant SVG icon strings. Colors go through `safeColor()`; instagram handle is regex-validated.
- Search uses `norm()`: converts Persian/Arabic digits to Latin, Arabic `ي`/`ك` to Persian `ی`/`ک`, strips ZWNJ and diacritics. Keep this when changing search.
- Prices are formatted with `toLocaleString("fa-IR")`.
- Recent commits come from "Zip2Git" uploads — the owner may update the repo by uploading a zip rather than via git.
