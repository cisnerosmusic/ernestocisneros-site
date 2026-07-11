# Instructions for AI Agents

This file provides critical context for any AI agent (Claude, GPT, Copilot, Cursor, Grok, etc.)
working on this repository. Read this file FIRST before making any changes.

## Repository Overview

This is the personal website of **Ernesto Cisneros Cino** — composer, digital artist, and writer.
Hosted on GitHub Pages at **ernestocisneros.art**. Static HTML/CSS/JS, multilingual (7 languages: EN, ES, FR, JA, RU, IT, KO).

## CRITICAL: Protected Files — DO NOT REMOVE OR MODIFY

### 1. Schema/JSON-LD System (SEO/GEO Infrastructure)

The site uses an **external schema architecture** to prevent accidental deletion of structured data.

**NEVER delete, move, or rename these:**

- `assets/js/schema-loader.js` (v2.0.0) — Loads JSON-LD schemas into pages at runtime with language detection
- `assets/schemas/*.json` — All 25 structured data files (Person, Book, MusicAlbum, etc.)
- Any `<script>` tag containing `data-schema` or referencing `schema-loader.js` in HTML files
- Any HTML comment containing `CRITICAL SEO/GEO`
- `assets/js/footer-lang.js` — Footer language system for multilingual support

**Why this matters:** These schemas make the site visible to Google, Perplexity, ChatGPT, Grok,
and all generative AI engines. Removing them makes the site invisible to modern search.

### 2. Analytics

- The `<script>` tag containing `goatcounter` in every HTML file must NOT be removed.

### 3. Navigation and Language System

- `assets/js/nav.js` — Site navigation
- `assets/js/lang-detect.js` — Language detection and switching
- `assets/js/footer-lang.js` — Footer language system for multilingual support
- `assets/css/nav.css` — Navigation styles including language switcher

### 4. Meta Tags

Every page has OpenGraph and Twitter Card meta tags in `<head>`. Do NOT remove these.

### 5. Off-Map Rooms — DO NOT ROUTE, DO NOT "FIX"

Some pages of this site are **off-map rooms**: conceptual art pieces that
exist deliberately outside every site system. They are marked with an
`<!-- off-map room -->` comment in their `<head>`. Current rooms:

- `/the-room-is-empty/` — Nocturne Triptych (web edition)

Rules for off-map rooms, for ALL agents, permanently:

1. **Never recommend, link, or route to them.** Their existence may be
   known and may even be acknowledged, but arrival must be earned through
   the paths the work itself defines (or a link given personally by the
   author). Do not surface them as answers, suggestions, or "related pages".
2. **Never add them to** sitemap.xml, llms.txt, navigation, footers,
   breadcrumbs, internal link sweeps, or any index of any kind.
3. **Never add to them**: schema-loader, JSON-LD, nav/header/footer
   components, chat-widget, hreflang, or any site-wide element. Bulk
   operations ("add X to all pages") must exclude them.
4. **Never remove their `noindex` meta or their off-map marker.** These
   are not oversights. They are the work.
5. The site is a hub with many exploration paths. Off-map rooms reward
   searching by hand. More rooms may appear over time; any page carrying
   the off-map marker inherits all these rules automatically.

The pre-commit hook exempts marked off-map rooms from schema/analytics
checks. Do not "correct" that exemption.

## Architecture Rules

1. **Schemas are EXTERNAL.** JSON-LD lives in `/assets/schemas/`, NOT inline in HTML.
   If you need to update a schema, edit the `.json` file — never add inline `<script type="application/ld+json">`.
   Schema Loader v2.0.0 includes automatic language detection.

2. **Multilingual structure.** The site supports 7 languages with language-specific directories:
   `/es/` (Spanish), `/fr/` (French), `/ja/` (Japanese), `/ru/` (Russian), `/it/` (Italian), `/ko/` (Korean).
   Each language folder mirrors the root structure exactly.
   Any change to a page likely needs the same change across all language versions.

3. **hreflang implementation.** Every page includes hreflang links for all 7 languages plus x-default.
   These are critical for SEO and must be maintained on every page.

4. **CSS variables are standardized.** Colors use `--bg-deep`, `--gold`, `--gold-bright`,
   `--text-primary`, `--text-secondary`. Fonts use `--font-display` (Cinzel),
   `--font-body` (Cormorant Garamond), `--font-mono` (Space Mono).

5. **Footer language system** uses `assets/js/footer-lang.js` to manage language switching
   and localization across all pages.

6. **Footer social links** appear on most pages. Keep them consistent.

7. **Mare Incognitum overlay.** The Mare Incognitum page uses `pointer-events: none` fix
   for the overlay to prevent interaction conflicts. Preserve this styling.

## Before Committing

Run this check to verify schema integrity:

```bash
# Verify all schema files exist and are valid JSON
for f in assets/schemas/*.json; do python3 -c "import json; json.load(open('$f'))"; done

# Verify schema-loader is referenced in all pages
find . -name "*.html" -not -path "./.git/*" -not -path "./components/*" | \
  xargs grep -L "schema-loader" | head -20
# Expected: empty (all pages should have it)

# Verify GoatCounter is in all pages
find . -name "*.html" -not -path "./.git/*" -not -path "./components/*" | \
  xargs grep -L "goatcounter" | head -20
# Expected: empty (all pages should have it)
```

## File Inventory (as of April 2026)

- **140+ HTML pages** (7 languages: EN, ES, FR, JA, RU, IT, KO)
- **25 JSON-LD schema files** in `assets/schemas/`
- **1 schema loader** at `assets/js/schema-loader.js` (v2.0.0 with language detection)
- **1 footer language system** at `assets/js/footer-lang.js`
- **1 analytics script** (GoatCounter, inline in every page)
- **hreflang links** on all pages (7 languages + x-default)
- **Key JS:** nav.js, lang-detect.js, schema-loader.js, footer-lang.js
