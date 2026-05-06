# Ernesto Cisneros Cino

**Composer, Pianist, Digital Artist & Writer**

Personal website of Ernesto Cisneros Cino, a Cuban composer, pianist, visual artist, mathematician, and writer based in Miami. This site serves as the central hub for his music, digital art (NFTs), published writings, theoretical research, and social impact projects.

Live at **[ernestocisneros.art](https://ernestocisneros.art)** | Available in 7 full languages (EN, ES, FR, IT, RU, JA, KO) + NFT Backup Guide in 14 languages

---

## Sections

- **Music**: Six albums with integrated web players: *Atlas of Fragmented Light*, *Glacial Paths*, *Mare Incognitum*, *Sandbank*, *Trash*, and *Velvet Alloy*, plus Other Musical Works.
- **NFT**: Selected works on Ethereum, Tezos, and Bitcoin. Collected works, BTC Ordinal Inscription #95908, community portraits (The Ernestitos), marketplace links, and Resources subpage with the Foundation backup guide, wallet guide, smart contracts guide, and decentralized storage guide.
- **Books**: *Sombras, Datos y Relámpagos*, *La Sospecha Razonable*, and *Huella* (forthcoming). The Power Trilogy, available on [Amazon](https://www.amazon.com/stores/Ernesto-Cisneros-Cino/author/B0FP5KBFNN).
- **Ideas**: Essays and research across four domains: art & poetics, cosmology & physics, culture & exile, and technology & society. Includes independent research in stochastic cosmology ([ORCID](https://orcid.org/0009-0002-2833-1787)). Featured essay: *Cuba: el riesgo de repetir el mecanismo* (ES/EN), with downloadable PDF versions.
- **Impulses.art**: Music therapy for refugees, families, and vulnerable communities. [impulses.online](https://impulses.online)
- **Biography**: Background and trajectory.
- **Contact**: Collaborations, commissions, and conversations.
- **NFT Backup Guide**: Step-by-step guide to back up NFTs from Foundation marketplace before shutdown. Available in 14 languages with full SEO, hreflang, and Schema.org structured data.
- **NFT Resource Guides** (EN + ES): Wallet guide, smart contracts guide, and decentralized storage guide for artists navigating Web3.

## Multilingual

Full site available in **7 languages**:

- English (EN): Root domain
- Spanish (ES): `/es/`
- French (FR): `/fr/`
- Italian (IT): `/it/`
- Russian (RU): `/ru/`
- Japanese (JA): `/ja/`
- Korean (KO): `/ko/`

**NFT Backup Guide** available in **14 languages** (7 above + 7 additional):

- Chinese (CH): `/translations/ch/`
- Portuguese (PT): `/translations/pt/`
- Ukrainian (UC): `/translations/ucr/`
- German (DE): `/translations/de/`
- Arabic (AR): `/translations/arabe/` (RTL)
- Farsi (FA): `/translations/far/` (RTL)
- Hindi (HI): `/translations/hindi/`

Automatic language detection via `lang-detect.js` with manual switcher in navigation and footer. hreflang links on all pages for proper language negotiation. The backup guide includes a 14-language switcher in each page header.

## Tech Stack

Static site built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step.

- **Fonts**: Cinzel (display), Cormorant Garamond (body), Space Mono (mono) via Google Fonts
- **Design**: Dark theme (`#080604`) with gold accents (`#d4a030`), particle canvas animations, responsive layouts
- **Audio**: Custom HTML5 audio players per album
- **Video**: Compressed MP4 (H.264) with autoplay/loop for NFT pieces
- **Analytics**: GoatCounter (cookie-free, privacy-respecting). [Dashboard](https://ernestocisnerosart.goatcounter.com)

## SEO / GEO Infrastructure

The site uses an external JSON-LD schema architecture for search engine and generative AI optimization:

- **25 schema files** in `assets/schemas/` (Person, Book, MusicAlbum, Article, VisualArtwork, Project, etc.)
- **`schema-loader.js` (v2.0.0)**: Fetches and injects schemas at runtime via `data-schema` attributes with language detection
- **`footer-lang.js`**: Manages multilingual language switching in the footer
- **`llms.txt`**: LLM discovery file following the emerging 2026 standard
- **`AGENTS.md`**: Protection instructions for AI agents working on this repository
- **Pre-commit hook** (`.githooks/pre-commit`): Blocks accidental deletion of schemas, analytics, or agent instructions
- **hreflang + canonical** on all 245+ pages (7 languages + x-default, 14 languages for backup guide)
- **`sitemap.xml`** with 245+ URLs covering all languages and translations
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
music/                    Album pages with players (7 albums)
nft.html                  NFT selected works
nft/                      Collections (ETH, Tezos, BTC, gifts, marketplaces, resources)
guide-backup-nft-en.html  NFT Backup Guide (English)
guide-wallet-en.html      NFT Wallet Guide (English)
guide-smart-contracts-en.html  Smart Contracts Guide (English)
guide-where-your-art-lives-en.html  Decentralized Storage Guide (English)
particles.html            Particle canvas visualization
en/                       English pages (alternative routing)
es/                       Spanish pages (full mirror of root structure)
fr/                       French pages (full mirror of root structure)
it/                       Italian pages (full mirror of root structure)
ru/                       Russian pages (full mirror of root structure)
ja/                       Japanese pages (full mirror of root structure)
ko/                       Korean pages (full mirror of root structure)
translations/
  arabe/                  Arabic guide (RTL)
  ch/                     Chinese guide
  de/                     German guide
  far/                    Farsi guide (RTL)
  hindi/                  Hindi guide
  pt/                     Portuguese guide
  ucr/                    Ukrainian guide
assets/
  audio/                  MP3 files (6 albums)
  css/                    Shared stylesheets (main.css, nav.css)
  images/                 Portraits, logos, book covers
  js/                     nav.js, lang-detect.js, schema-loader.js (v2.0.0), footer-lang.js
  nft/compressed/         Optimized images and videos for NFT sections
  pdf/                    Research papers (cosmology, technology)
  schemas/                25 JSON-LD structured data files
components/               Reusable header and footer HTML
llms.txt                  LLM discovery file
humans.txt                humans.txt (humanstxt.org format)
AGENTS.md                 AI agent protection instructions
.githooks/pre-commit      Schema/analytics protection hook
robots.txt                Search engine + AI crawler directives
sitemap.xml               Full multilingual sitemap (245+ URLs)
privacy-policy/           Privacy policy
404.html                  Custom error page
```

## Agent Protection

This repository includes a multi-layer defense system to prevent AI agents from accidentally deleting critical infrastructure:

1. **External schemas**: JSON-LD lives in separate `.json` files, not inline in HTML
2. **AGENTS.md**: Read-first instructions for any AI agent working on the code
3. **Pre-commit hook**: Blocks commits that remove schemas, GoatCounter, or AGENTS.md
4. **HTML comments**: `<!-- CRITICAL SEO/GEO -->` markers on protected elements
5. **Multilingual safeguards**: Changes to pages require updates across all 7 language versions

The site contains 245+ pages across 7 full languages + 7 additional translation languages. Always verify that schema, hreflang, and analytics changes are propagated to all language versions.

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
