# FreeConvertX

**All formats, free forever. لكل الصيغ، مجاناً للأبد.**

A private, lightning-fast image converter that runs entirely in your browser. No uploads, no tracking, no accounts.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Universal converter** — PNG, JPG, JPEG, WEBP, HEIC/HEIF, GIF, BMP, SVG, AVIF, TIFF → JPG, PNG, WEBP, AVIF, PDF, BMP
- **Batch processing** — drop 50+ files, convert, download as ZIP
- **HEIC/HEIF support** — iPhone photos decoded directly in the browser via `heic2any`
- **Image resize tool** — pixels or percent, keep aspect ratio
- **Crop tool** — interactive, preset ratios (1:1, 4:3, 16:9, 9:16, etc.)
- **Images to PDF** — combine multiple images with reordering and page sizes
- **GIF frames** — extract every frame as PNG/JPG via `ImageDecoder` with a pure-JS fallback decoder
- **URL fetch** — paste an image URL and convert directly
- **Quality slider** — 10–100%, live size estimates
- **Auto rename** — `image-{n}` style patterns
- **i18n** — full English + Arabic (RTL) with instant language switching
- **Dark mode** — system, light, dark
- **100% client-side** — files never leave the device
- **SEO** — sitemap, robots, OpenGraph, JSON-LD structured data

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + Framer Motion
- Zustand (state)
- `next-intl` (i18n) + `next-themes` (dark mode)
- `heic2any`, `jspdf`, `jszip`, `react-easy-crop`
- Lucide React icons

## Getting started

```bash
# 1. Install
npm install

# 2. Run dev server
npm run dev

# 3. Open
# http://localhost:3000  → auto-redirects to /en or /ar
```

Build & run production:

```bash
npm run build
npm start
```

Type check:

```bash
npm run typecheck
```

## Deploy

### Vercel (recommended)

```bash
npx vercel
```

Push to GitHub, then import the repo on [vercel.com](https://vercel.com) — zero config.

### Netlify

```bash
npm run build
# Deploy with Netlify CLI or drag-and-drop the .next/ output
```

### Static export

This app uses server components for i18n, so for a fully static export you can add `output: 'export'` to `next.config.mjs` and use the `[locale]` route structure. Some features (like middleware redirect at `/`) will need adjustment.

## Project structure

```
src/
  app/
    [locale]/           # i18n-aware routes (en, ar)
      page.tsx          # Home (hero + converter + tools)
      converter/        # /converter
      tools/
        resize/
        crop/
        pdf/
        gif/
      layout.tsx        # Locale layout with Header/Footer
    layout.tsx          # Root layout (metadata)
    not-found.tsx
    sitemap.ts
    robots.ts
    globals.css
  components/
    converter/Converter.tsx    # Universal drag-drop converter
    tools/                     # ResizeTool, CropTool, PdfTool, GifTool
    sections/                  # Hero, PopularFormats, ToolsGrid, PrivacySection, FAQ
    layout/                    # Header, Footer
    providers/ThemeProvider.tsx
  lib/
    imageConverter.ts          # Canvas-based encode/decode + HEIC + BMP + PDF
    formats.ts                 # Format enums + helpers
    store.ts                   # Zustand store for batch state
    utils.ts                   # cn, formatBytes, downloadBlob, etc.
  i18n/
    request.ts                 # next-intl loader
    routing.ts                 # locales + Link helper
  middleware.ts                # Locale routing
messages/
  en.json
  ar.json
```

## Privacy

- No file uploads
- No tracking, analytics, or cookies
- No accounts or login
- All processing in your browser via Canvas API + WebAssembly

## Notes on format support

| Format | Decode | Encode |
|--------|:------:|:------:|
| PNG    | ✅ native | ✅ native |
| JPG    | ✅ native | ✅ native |
| WEBP   | ✅ native | ✅ native |
| AVIF   | ✅ modern browsers | ✅ Chrome/Edge/Firefox |
| GIF    | ✅ native + frame extraction | ⚠️ static only |
| BMP    | ✅ native | ✅ custom encoder |
| HEIC/HEIF | ✅ `heic2any` | ❌ falls back to JPG |
| SVG    | ✅ rasterized | ❌ |
| TIFF   | ⚠️ browser-dependent | ❌ |
| PDF    | — | ✅ `jsPDF` |

## License

MIT
# convertfree
# convertfree
