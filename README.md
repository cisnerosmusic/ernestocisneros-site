# Ernesto Cisneros Cino

**Composer, Pianist, Digital Artist & Writer**

Personal website of Ernesto Cisneros Cino — a Cuban composer, pianist, visual artist, mathematician, and writer based in Miami. This site serves as the central hub for his music, digital art (NFTs), published writings, theoretical research, and social impact projects.

Live at **[ernestocisneros.art](https://ernestocisneros.art)**

---

## Sections

- **Music** — Five albums with integrated web players: *Atlas of Fragmented Light*, *Glacial Paths*, *Mare Incognitum*, *Sandbank*, and *Trash*.
- **NFT** — Selected works on Ethereum, Tezos, and Bitcoin. Collected works, BTC Ordinal Inscription #95908, and community portraits (The Ernestitos).
- **Books** — *Sombras, Datos y Relámpagos*, *La Sospecha Razonable*, and *Huella* (forthcoming). The Power Trilogy — available on [Amazon](https://www.amazon.com/stores/Ernesto-Cisneros-Cino/author/B0FP5KBFNN).
- **Ideas** — Essays and research across four domains: art & poetics, cosmology & physics, culture & exile, and technology & society. Includes independent research in stochastic cosmology ([ORCID](https://orcid.org/0009-0002-2833-1787)).
- **Impulses.art** — Music therapy for refugees, families, and vulnerable communities. [impulses.online](https://impulses.online)
- **Biography** — Background and trajectory.
- **Contact** — Collaborations, commissions, and conversations.

## Bilingual

Full site available in English and Spanish (`/es/`). Automatic language detection via `lang-detect.js` with manual switcher in navigation.

## Tech Stack

Static site built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step.

- **Fonts**: Cinzel (display), Cormorant Garamond (body), Space Mono (mono) via Google Fonts
- **Design**: Dark theme (`#080604`) with gold accents (`#d4a030`), particle canvas animations, responsive layouts
- **Audio**: Custom HTML5 audio players per album
- **Video**: Compressed MP4 (H.264) with autoplay/loop for NFT pieces
- **Analytics**: GoatCounter (cookie-free, privacy-respecting) — [dashboard](https://ernestocisnerosart.goatcounter.com)

## SEO / GEO Infrastructure

The site uses an external JSON-LD schema architecture for search engine and generative AI optimization:

- **25 schema files** in `assets/schemas/` (Person, Book, MusicAlbum, Article, VisualArtwork, Project, etc.)
- **`schema-loader.js`** fetches and injects schemas at runtime via `data-schema` attributes
- **`llms.txt`** — LLM discovery file following the emerging 2026 standard
- **`AGENTS.md`** — Protection instructions for AI agents working on this repository
- **Pre-commit hook** (`.githooks/pre-commit`) blocks accidental deletion of schemas, analytics, or agent instructions
- **Canonical + hreflang** on all 51 pages (EN + ES + x-default)
- **`sitemap.xml`** with 47 URLs covering both languages
- **`robots.txt`** with explicit permissions for AI crawlers (GPTBot, anthropic-ai, Claude-Web, Google-Extended)

## Project Structure

```
index.html                Home
biography.html            Biography
books.html                Published books (Amazon links)
contact.html              Contact
ideas.html                Essays index
ideas/                    Individual essay pages (cosmology, philosophy, culture, technology)
impulses-art.html         Music therapy project
music.html                Music index
music/                    Album pages with players
nft.html                  NFT selected works
nft/                      Collections (ETH, Tezos, BTC, gifts, marketplaces)
artemis-ii.html           Artemis II live mission tracker
es/                       Full Spanish mirror of all pages
assets/
  audio/                  MP3 files (5 albums)
  css/                    Shared stylesheets (main.css, nav.css)
  images/                 Portraits, logos, book covers
  js/                     nav.js, lang-detect.js, schema-loader.js
  nft/compressed/         Optimized images and videos for NFT sections
  pdf/                    Research papers (cosmology, technology)
  schemas/                25 JSON-LD structured data files
components/               Reusable header and footer HTML
llms.txt                  LLM discovery file
AGENTS.md                 AI agent protection instructions
.githooks/pre-commit      Schema/analytics protection hook
robots.txt                Search engine + AI crawler directives
sitemap.xml               Full bilingual sitemap (47 URLs)
404.html                  Custom error page
```

## Agent Protection

This repository includes a multi-layer defense system to prevent AI agents from accidentally deleting critical infrastructure:

1. **External schemas** — JSON-LD lives in separate `.json` files, not inline in HTML
2. **AGENTS.md** — Read-first instructions for any AI agent working on the code
3. **Pre-commit hook** — Blocks commits that remove schemas, GoatCounter, or AGENTS.md
4. **HTML comments** — `<!-- CRITICAL SEO/GEO -->` markers on protected elements

To activate the pre-commit hook after cloning:

```bash
git config core.hooksPath .githooks
```

## Deployment

Static site on GitHub Pages with custom domain. To serve locally:

```bash
python3 -m http.server 8000
# or
npx serve .
```

## License

All rights reserved. See [LICENSE](LICENSE) for details.

---

**[ernestocisneros.art](https://ernestocisneros.art)**
