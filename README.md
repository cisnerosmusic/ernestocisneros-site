# Ernesto Cisneros Cino

**Composer, Pianist, Digital Artist, Mathematician & Writer**

Personal website of Ernesto Cisneros Cino, a Cuban composer, pianist, visual artist, mathematician, and writer based in Miami. This site serves as the central hub for his music, digital art (NFTs), published writings, theoretical research, and social impact projects.

Live at **[ernestocisneros.art](https://ernestocisneros.art)** | 304 pages across 7 full languages (EN, ES, FR, IT, RU, JA, KO) + NFT Backup Guide in 14 languages | PWA-ready

---

## Sections

- **Music**: Eight album pages with integrated web players: *Atlas of Fragmented Light*, *Glacial Paths*, *Mare Incognitum* (3D WebGL visualization), *Nocturne of Glass Currents*, *Sandbank*, *Trash*, *Velvet Alloy*, and *Other Musical Works*. Full cross-navigation between all albums. Redirect stubs in FR, IT, JA, KO, RU (40 pages).
- **NFT**: Selected works on Ethereum, Tezos, and Bitcoin. Collected works, BTC Ordinal Inscription #95908, community portraits (The Ernestitos), marketplace links, and Resources subpage with the Foundation backup guide, wallet guide, smart contracts guide, and decentralized storage guide.
- **Books**: *Sombras, Datos y Relámpagos*, *La Sospecha Razonable*, *No apagues la luz* (horror, 11 stories + prologue, full bilingual web edition: 13 EN chapters + 13 ES chapters), *Huella*, *La Necesidad de Creer*, and *Manual de bolsillo para sonidistas* (technical sound engineering reference, 40pp, Spanish only). Available on [Amazon](https://www.amazon.com/stores/Ernesto-Cisneros-Cino/author/B0FP5KBFNN), Zenodo (open access), and via Stripe (PDF).
- **Ideas**: 16 essays and research pieces across four domains: art & poetics, cosmology & physics, culture & exile, and technology & society. Includes independent research in stochastic cosmology ([ORCID](https://orcid.org/0009-0002-2833-1787)). Featured essays: *Cuba: el riesgo de repetir el mecanismo* (ES/EN) with downloadable PDFs, *The Invisible Power of Algorithms* (EN/ES).
- **Impulses.art**: Music therapy for refugees, families, and vulnerable communities. [impulses.online](https://impulses.online)
- **Biography**: Background and trajectory. Links to Wikipedia, IMDb, ORCID.
- **Contact**: Collaborations, commissions, and conversations. Features the animated "Linterna" beam-edge effect — a gold conic-gradient light that traces the contact block border on scroll, adapted from the Index01 effects library.
- **Privacy Policy**: Cookie-free analytics disclosure, data handling, and GDPR/CCPA compliance.
- **NFT Backup Guide**: Step-by-step guide to back up NFTs from Foundation marketplace before shutdown. Available in 14 languages with full SEO, hreflang, and Schema.org structured data.
- **NFT Resource Guides** (EN + ES): Wallet guide, smart contracts guide, and decentralized storage guide for artists navigating Web3.
- **AI Chatbot**: Conversational assistant powered by Claude v2 (via Cloudflare Worker with tool calling and analytics), integrated across 240+ non-music pages. Provides contextual answers about the artist's work, music, books, essays, and projects.

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
- **Audio**: Custom HTML5 audio players per album with track-by-track playback
- **3D**: Three.js WebGL visualization on Mare Incognitum album page
- **Video**: Compressed MP4 (H.264) with autoplay/loop for NFT pieces
- **Effects**: CSS `@property`-powered animated effects from the Index01 effects library — beam-edge "Linterna" (conic-gradient rotating border light with `mask-composite: exclude`, triggered by `IntersectionObserver`), adapted to site gold palette
- **PWA**: Progressive Web App support via `manifest.json` with 192px and 512px icons
- **Chatbot**: AI assistant v2 (`chatbot/worker.js`) backed by Cloudflare Worker using Claude API with tool calling, analytics, and contextual knowledge base. Widget (`chat-widget.js`) integrated across 240+ pages, excluded from music player pages to avoid audio interference
- **Payments**: Stripe Payment Links for book sales (EN/ES), integrated into Books section
- **Analytics**: GoatCounter (cookie-free, privacy-respecting) on 249 pages. [Dashboard](https://ernestocisnerosart.goatcounter.com)
- **Social**: Linktree in footer across all pages, IMDb on biography

## SEO / GEO Infrastructure

The site uses an external JSON-LD schema architecture for search engine and generative AI optimization:

- **29 schema files** in `assets/schemas/` (Person, Book, MusicAlbum, Article, VisualArtwork, Project, etc.)
- **`schema-loader.js` (v2.0.0)**: Fetches and injects schemas at runtime via `data-schema` attributes with language detection
- **`footer-lang.js`**: Manages multilingual language switching in the footer
- **`llms.txt`**: LLM discovery file following the emerging 2026 standard
- **`AGENTS.md`**: Protection instructions for AI agents working on this repository
- **Pre-commit hook** (`.githooks/pre-commit`): Blocks accidental deletion of schemas, analytics, or agent instructions
- **hreflang + canonical** on all 304 pages (7 languages + x-default, 14 languages for backup guide), fully reciprocal
- **`sitemap.xml`** with 288 URLs covering all languages and translations
- **OG/Twitter tags** on all pages including redirect stubs for consistent social sharing
- **Accessibility**: `aria-label` on all logo links, semantic heading hierarchy (h1→h2→h3, no skips), `defer` on all scripts, `prefers-reduced-motion` respected on animated effects
- **`robots.txt`** with explicit permissions for AI crawlers (GPTBot, anthropic-ai, Claude-Web, Google-Extended)

## Project Structure

```
index.html                Home
biography.html            Biography (Wikipedia, IMDb, ORCID)
books.html                Published books (Amazon + Stripe)
contact.html              Contact (beam-edge "Linterna" effect)
ideas.html                Essays index
ideas/                    16 essay pages (cosmology, philosophy, culture, technology)
impulses-art.html         Music therapy project
music.html                Music index
music/                    8 album pages with integrated players
nft.html                  NFT selected works
nft/                      7 collection pages (ETH, Tezos, BTC, gifts, marketplaces, resources, learn)
books/                    "Don't Turn Off the Light" web edition (13 EN chapters)
guide-backup-nft-en.html  NFT Backup Guide (English)
guide-wallet-en.html      NFT Wallet Guide (English)
guide-smart-contracts-en.html  Smart Contracts Guide (English)
guide-where-your-art-lives-en.html  Decentralized Storage Guide (English)
particles.html            Particle canvas visualization
es/                       Spanish (full mirror + 4 guides + 13 book chapters + 15 essays)
fr/                       French (full mirror + 8 music redirects)
it/                       Italian (full mirror + 8 music redirects)
ru/                       Russian (full mirror + 8 music redirects)
ja/                       Japanese (full mirror + 8 music redirects)
ko/                       Korean (full mirror + 8 music redirects)
translations/
  arabe/                  Arabic guide (RTL)
  ch/                     Chinese guide
  de/                     German guide
  far/                    Farsi guide (RTL)
  hindi/                  Hindi guide
  pt/                     Portuguese guide
  ucr/                    Ukrainian guide
assets/
  audio/                  Audio files (6 album directories + individual tracks)
  css/                    3 stylesheets (fonts.css, main.css, nav.css)
  images/                 23 images (portraits, logos, book covers)
  js/                     7 scripts (nav, lang-detect, schema-loader v2, footer-lang, components, crypto-tracker, main)
  nft/compressed/         35 optimized images and videos for NFT sections
  pdf/                    PDFs: 8 cosmology papers, 6 technology papers, 5 essay PDFs
  schemas/                29 JSON-LD structured data files
chatbot/                  AI chatbot v2 (chat-widget.js, worker.js, system-prompt.txt)
components/               Reusable header (2.9KB) and footer (7.9KB) HTML
manifest.json             PWA manifest with app icons
llms.txt                  LLM discovery file
humans.txt                humans.txt (humanstxt.org format)
AGENTS.md                 AI agent protection instructions
.githooks/pre-commit      Schema/analytics protection hook
robots.txt                Search engine + AI crawler directives
sitemap.xml               Full multilingual sitemap (288 URLs)
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

The site contains 304 pages across 7 full languages + 7 additional translation languages. Always verify that schema, hreflang, and analytics changes are propagated to all language versions.

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

*Last updated: June 20, 2026*

---

Developed by [Index01](https://index01.net)
