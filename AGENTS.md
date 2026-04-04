# Instructions for AI Agents

This file provides critical context for any AI agent (Claude, GPT, Copilot, Cursor, Grok, etc.)
working on this repository. Read this file FIRST before making any changes.

## Repository Overview

This is the personal website of **Ernesto Cisneros Cino** — composer, digital artist, and writer.
Hosted on GitHub Pages at **ernestocisneros.art**. Static HTML/CSS/JS, bilingual (EN + ES).

## CRITICAL: Protected Files — DO NOT REMOVE OR MODIFY

### 1. Schema/JSON-LD System (SEO/GEO Infrastructure)

The site uses an **external schema architecture** to prevent accidental deletion of structured data.

**NEVER delete, move, or rename these:**

- `assets/js/schema-loader.js` — Loads JSON-LD schemas into pages at runtime
- `assets/schemas/*.json` — All 25 structured data files (Person, Book, MusicAlbum, etc.)
- Any `<script>` tag containing `data-schema` or referencing `schema-loader.js` in HTML files
- Any HTML comment containing `CRITICAL SEO/GEO`

**Why this matters:** These schemas make the site visible to Google, Perplexity, ChatGPT, Grok,
and all generative AI engines. Removing them makes the site invisible to modern search.

### 2. Analytics

- The `<script>` tag containing `goatcounter` in every HTML file must NOT be removed.

### 3. Navigation and Language System

- `assets/js/nav.js` — Site navigation
- `assets/js/lang-detect.js` — Language detection and switching
- `assets/css/nav.css` — Navigation styles including language switcher

### 4. Meta Tags

Every page has OpenGraph and Twitter Card meta tags in `<head>`. Do NOT remove these.

## Architecture Rules

1. **Schemas are EXTERNAL.** JSON-LD lives in `/assets/schemas/`, NOT inline in HTML.
   If you need to update a schema, edit the `.json` file — never add inline `<script type="application/ld+json">`.

2. **Spanish pages mirror English.** The `/es/` folder mirrors root structure exactly.
   Any change to an EN page likely needs the same change in its ES counterpart.

3. **CSS variables are standardized.** Colors use `--bg-deep`, `--gold`, `--gold-bright`,
   `--text-primary`, `--text-secondary`. Fonts use `--font-display` (Cinzel),
   `--font-body` (Cormorant Garamond), `--font-mono` (Space Mono).

4. **Footer social links** appear on most pages. Keep them consistent.

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

- **50+ HTML pages** (EN + ES)
- **25 JSON-LD schema files** in `assets/schemas/`
- **1 schema loader** at `assets/js/schema-loader.js`
- **1 analytics script** (GoatCounter, inline in every page)
- **Key JS:** nav.js, lang-detect.js, schema-loader.js
