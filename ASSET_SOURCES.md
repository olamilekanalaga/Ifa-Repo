# Asset sources

Retrieved 14 October 2026. All assets are bundled locally; the demo needs no external image host.

## Brand marks

Campaigns in this demo are fictional examples. The named companies have not funded, endorsed or partnered on them. Brand marks remain the property of their owners and are used only to identify example brands. This file does not grant trademark rights or commercial campaign permission.

| Brand | Local file | Source | Provenance |
| --- | --- | --- | --- |
| Phantom | `public/assets/logos/phantom.svg` | [Source](https://sanity-proxy-v2.phantom.app/files/3nm6d03a/production/5e73f0ad2d621b5ed6ca3c66aad2b70686f8a00e.zip) · [Official page](https://phantom.com) | Official press kit linked from phantom.com; extracted Nov 2024/Phantom App Icon/phantom-app-icon-drkprpl.svg |
| Jupiter | `public/assets/logos/jupiter.svg` | [Source](https://jup.ag/favicon.svg) · [Official page](https://jup.ag) | Official website SVG favicon |
| MetaMask | `public/assets/logos/metamask.svg` | [Source](https://assets.ctfassets.net/clixtyxoaeas/1d7h0Cnm1RaQ0TspxaTS0H/57418d60d3a13fbee748be1ca560235a/MetaMask-Logo-Pack__4_.zip) · [Official page](https://metamask.io/assets) | Official MetaMask logo pack; extracted MetaMask-Logo-Pack/MetaMask/MetaMask-icon-fox.svg |
| Uniswap | `public/assets/logos/uniswap.png` | [Source](https://raw.githubusercontent.com/Uniswap/interface/main/apps/web/public/favicon.png) · [Official page](https://github.com/Uniswap/interface) | Official Uniswap interface repository favicon |
| Aave | `public/assets/logos/aave.png` | [Source](https://aave.com/favicon.png) · [Official page](https://aave.com/brand) | Official website PNG favicon |
| OpenSea | `public/assets/logos/opensea.png` | [Source](https://opensea.io/favicon.ico) · [Official page](https://opensea.io) | Official website ICO converted losslessly to RGBA PNG, original resolution 48px |
| Magic Eden | `public/assets/logos/magic-eden.png` | [Source](https://magiceden.io/img/favicon/android-chrome-192x192.png) · [Official page](https://magiceden.io) | Official website app icon referenced in HTML head |
| Axie Infinity | `public/assets/logos/axie-infinity.png` | [Source](https://axieinfinity.com/favicon.ico) · [Official page](https://axieinfinity.com) | Official website ICO converted losslessly to RGBA PNG, original resolution 48px |
| Audius | `public/assets/logos/audius.png` | [Source](https://audius.co/favicons/apple-touch-icon.png) · [Official page](https://audius.co) | Official website app icon referenced in HTML head |
| Zora | `public/assets/logos/zora.png` | [Source](https://zora.co/favicon.ico) · [Official page](https://zora.co) | Official website ICO converted losslessly to RGBA PNG, original resolution 48px |

## Creator avatars

24 deterministic Nouns trait compositions are included in `public/assets/avatars/noun-01.svg` through `noun-24.svg`. The 1,000 demo profiles may reuse these 24 images. Identities, handles, scores and campaigns are synthetic. Avatars do not identify actual NFT owners, and are not claimed to be specific minted Noun IDs.

The artwork was assembled from the official [Nouns image data](https://raw.githubusercontent.com/nounsDAO/nouns-monorepo/master/packages/nouns-assets/src/image-data.json). The [official Nouns brand page](https://nouns.wtf/brand) states that its logos, traits and generated Nouns are CC0. [OpenSea collection reference](https://opensea.io/collection/nouns) was checked, but marketplace owners and identity data were not copied.

`public/assets/avatars/manifest.json` records the exact component filenames for each generated combination. The SVG renderer only decodes the onchain run-length encoded pixel artwork; no AI-generated or traced lookalikes were used.

## Typography

Manrope variable font is included at `public/assets/fonts/manrope-variable.ttf`. Source: [Google Fonts Manrope](https://github.com/google/fonts/tree/main/ofl/manrope). License: SIL Open Font License 1.1; full license is bundled as `public/assets/fonts/OFL-Manrope.txt`.

## Integrity

`public/assets/manifest.json` includes exact download URLs, provenance and SHA-256 hashes for the 10 brand assets.

SEND brandmark: official SEND brand asset library https://info.send.it/docs/miscellaneous/brand-links-assets ; downloaded https://info.send.it/img/SendBrandmark.svg . Used to identify the historical report, no endorsement claimed. send.app blocked direct asset retrieval.

Breshna logo: downloaded from the official website asset https://breshna.io/_next/static/media/breshnaNameLogo.e0b2d894.svg . Original colors and proportions preserved. Used to identify this historical report; no endorsement claimed.

Breshna card icon: viewport crop of the left-hand symbol in the original official SVG, with original artwork and colors retained. Full wordmark preserved for report headings.

User-supplied project logo images: Photo 1 → PRINT3R (print3r.jpg), Photo 2 → SEND (send.jpg), Photo 3 → Breshna (breshna.jpg). Used unchanged on cards and report pages, replacing the earlier logo variants.

Default creator avatar: user-supplied Photo 1, saved unchanged as public/assets/avatars/la-crrypt.jpg. Display name set to the user's requested name; activity and content signals remain sample data.
