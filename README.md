# Ernesto Cisneros Cino

**Composer, Pianist, Digital Artist & Writer**

Personal website of Ernesto Cisneros Cino — a Cuban composer, pianist, visual artist, mathematician, and writer based in Miami. This site serves as the central hub for his music, digital art (NFTs), published writings, and theoretical research.

---

## Sections

- **Music** — Five albums with integrated web players: *Atlas of Fragmented Light*, *Glacial Paths*, *Mare Incognitum*, *Sandbank*, and *Trash*.
- **NFT** — Selected works on Ethereum and Tezos, collected works from both chains, BTC ordinals, and a curated section of community gifts.
- **Books** — Published works including *Sombras, Datos y Relámpagos*, *La Sospecha*, and *Huella Sobre el Hielo*.
- **Ideas** — Essays and research across four domains: art & poetics, cosmology & physics, culture & exile, and technology & society.
- **Impulses** — Visual art explorations.
- **Biography** — Background and trajectory.
- **Contact** — Reach out.

## Tech Stack

Static site built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step.

- **Fonts**: Cinzel, Cormorant Garamond, Space Mono (Google Fonts)
- **Design**: Dark theme with gold accents, particle canvas animations, responsive layouts
- **Audio**: Custom HTML5 audio players per album
- **Video**: Compressed MP4 (H.264) with autoplay/loop for NFT pieces
- **Components**: Shared header/footer via JS injection (`components/`)

## Project Structure

```
index.html              Home
biography.html          Biography
books.html              Published books
contact.html            Contact
ideas.html              Essays index
ideas/                  Individual essay pages
impulses-art.html       Visual art
music.html              Music index
music/                  Album pages with players
nft.html                NFT selected works
nft/                    Collections (ETH, Tezos, BTC, gifts, marketplaces)
assets/
  audio/                MP3 files (5 albums)
  css/                  Shared stylesheet
  images/               Portraits, logos, book covers
  js/                   Shared scripts (components loader, main)
  nft/compressed/       Optimized images and videos for NFT sections
  pdf/                  Research papers (cosmology, technology)
components/             Reusable header and footer HTML
robots.txt              Search engine directives
sitemap.xml             Sitemap
404.html                Custom error page
```

## Deployment

This is a static site. To serve locally:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

For production, deploy to any static hosting service (GitHub Pages, Netlify, Vercel, or traditional web hosting).

## License

All rights reserved. See [LICENSE](LICENSE) for details.

---

**ernestocisneros.com**
