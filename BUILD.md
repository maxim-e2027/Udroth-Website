# Udroth Website — Build Instructions

## Prerequisites
- Node.js 18+ (recommended: 20+)
- npm

## First-time setup

```bash
cd Udroth-Website
rm -rf node_modules package-lock.json   # clean slate
npm install
```

## Development (local preview)

```bash
npm run dev
```
Opens at http://localhost:4321

## Production build

```bash
npm run build
npm run preview   # preview the built site
```

Output goes to `dist/`.

## How it works

- **Content lives in Obsidian** — edit `Texts/`, `Images/`, `Authors/`, `Locations/` as normal Obsidian notes
- **Templates/** — use these as Obsidian templates for new entries (Insert Template)
- **assets/** — put image files (maps, illustrations) here; they get copied to `public/assets/` at build time
- **Frontmatter tags** drive the site — all 7 facets (place, era, culture, politics, people, religion, social_org) are consistent across all content types
- **`publish: true`** in frontmatter = appears on the site; `false` = draft

## Deploy

Push to GitHub, connect to Cloudflare Pages or Vercel:
- Build command: `npm run build`
- Output directory: `dist`
