# ARCHITECTURE.md

## 1. PROJECT STRUCTURE

```
ASCII-backgrounds/
├── public/                          # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                         # Next.js App Router (pages & layout)
│   │   ├── favicon.ico
│   │   ├── globals.css              # Tailwind v4 global styles
│   │   ├── layout.tsx               # Root layout (fonts, dark theme)
│   │   └── page.tsx                 # Main page — orchestrates all UI
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives (Base UI + CVA)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── toggle-group.tsx
│   │   ├── ascii-preview.tsx        # Renders ASCII grid with zoom controls
│   │   ├── color-picker.tsx         # Hex color picker (popover + native input)
│   │   ├── controls-panel.tsx       # Left sidebar — all settings sliders/toggles
│   │   ├── export-dialog.tsx        # PNG export dialog with quality presets
│   │   ├── playback-controls.tsx    # Animation transport bar (play/pause/scrub/speed)
│   │   ├── slider-with-input.tsx    # Slider + numeric text input combo
│   │   └── upload-zone.tsx          # Drag-and-drop / click-to-browse file input
│   ├── hooks/
│   │   ├── use-ascii-converter.ts   # Debounced image → ASCII conversion
│   │   ├── use-animation-converter.ts # Multi-frame → ASCII + playback state
│   │   ├── use-image-upload.ts      # (legacy) Static image upload handler
│   │   └── use-media-upload.ts      # Unified media upload (image/GIF/video)
│   ├── lib/
│   │   ├── ascii-converter.ts       # Core pixel-sampling & char-mapping algorithm
│   │   ├── constants.ts             # Charsets, default settings, export presets
│   │   ├── export-utils.ts          # html2canvas-pro PNG export pipeline
│   │   ├── frame-extractor.ts       # Video & GIF frame extraction (ImageDecoder API)
│   │   └── utils.ts                 # Tailwind `cn()` merge helper
│   └── types/
│       └── index.ts                 # Shared TypeScript interfaces & type aliases
├── components.json                  # shadcn configuration
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind (v4 via postcss)
└── tsconfig.json
```

---

## 2. HIGH-LEVEL SYSTEM DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Upload   │──▶│ Frame        │──▶│ ASCII          │  │
│  │  Zone     │   │ Extractor    │   │ Converter      │  │
│  │(drag/drop)│   │(video/GIF)   │   │(pixel→char map)│  │
│  └──────────┘   └──────────────┘   └───────┬────────┘  │
│                                            │            │
│                                            ▼            │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │ Controls  │──▶│ Settings     │──▶│ ASCII Preview  │  │
│  │ Panel     │   │ State        │   │ (zoom/pan)     │  │
│  └──────────┘   └──────────────┘   └───────┬────────┘  │
│                                            │            │
│                                            ▼            │
│                                    ┌────────────────┐   │
│                                    │ Export Dialog   │   │
│                                    │ (PNG download)  │   │
│                                    └────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

This is a **fully client-side** single-page application. There is no backend, database, or external API. All image processing happens in the browser using Canvas APIs.

---

## 3. CORE COMPONENTS

### 3.1 Frontend (Single Page Application)

| Aspect       | Detail                                                            |
| ------------ | ----------------------------------------------------------------- |
| Framework    | **Next.js 16.2** (App Router, `"use client"` throughout)         |
| UI Library   | **React 19.2** with **shadcn/ui v4** (Base UI + CVA + Tailwind)  |
| Styling      | **Tailwind CSS v4** (PostCSS plugin), dark theme by default      |
| Icons        | **Lucide React**                                                  |
| Fonts        | Figtree (sans), Geist Mono (monospace)                            |
| Deployment   | Static export or Node.js server via `next build && next start`    |

### 3.2 ASCII Conversion Engine (`src/lib/ascii-converter.ts`)

- **Purpose:** Converts pixel data into a grid of ASCII characters with optional per-character color.
- **Algorithm:**
  1. Draw source (image or canvas frame) onto an offscreen `<canvas>`.
  2. Apply brightness/contrast adjustments to raw pixel data.
  3. Divide the image into a grid of cells (columns × auto-calculated rows).
  4. For each cell, compute average RGB and luminance.
  5. Map luminance to a character from the selected charset.
- **Exports:** `convertToAscii()` (from `HTMLImageElement`) and `convertCanvasToAscii()` (from `HTMLCanvasElement` for animation frames).

### 3.3 Frame Extraction Engine (`src/lib/frame-extractor.ts`)

- **Purpose:** Extracts individual frames from GIFs and videos for animation-to-ASCII conversion.
- **Technologies:** Browser `ImageDecoder` API (for GIFs), `HTMLVideoElement` seeking (for videos).
- **Constraints:** Max 800px dimension, max 120 frames, target 12 fps for videos.

### 3.4 Export Pipeline (`src/lib/export-utils.ts`)

- **Purpose:** Renders the ASCII `<pre>` element to a PNG image for download.
- **Technology:** `html2canvas-pro` with configurable scale (1x–6x).

### 3.5 Key Hooks

| Hook                     | Purpose                                                    |
| ------------------------ | ---------------------------------------------------------- |
| `useMediaUpload`         | Handles file input, detects media type, dispatches to image loader or frame extractor |
| `useAsciiConverter`      | Debounced (50ms) conversion of a single image to ASCII     |
| `useAnimationConverter`  | Batch-converts all frames, manages playback loop & seeking |

---

## 4. DATA STORES

**None.** This application has no server-side persistence. All state is held in React component state within the browser session:

| State                | Location               | Description                            |
| -------------------- | ---------------------- | -------------------------------------- |
| `AsciiSettings`      | `useState` in `page.tsx` | User-controlled conversion parameters |
| Uploaded media       | `useMediaUpload` hook  | `HTMLImageElement` or `HTMLCanvasElement[]` frames in memory |
| Converted ASCII      | `useAsciiConverter` / `useAnimationConverter` | `AsciiOutput` grid(s) in memory |

---

## 5. EXTERNAL INTEGRATIONS

| Service / Library    | Purpose                                       | Integration Method        |
| -------------------- | --------------------------------------------- | ------------------------- |
| `html2canvas-pro`    | DOM-to-canvas rendering for PNG export         | NPM dependency, client-side |
| Google Fonts         | Figtree & Geist Mono font loading              | `next/font/google`        |

No third-party APIs, analytics, or authentication services are used.

---

## 6. DEPLOYMENT & INFRASTRUCTURE

| Aspect          | Detail                                                        |
| --------------- | ------------------------------------------------------------- |
| Platform        | Any static hosting or Node.js environment                     |
| Build command   | `next build`                                                  |
| Start command   | `next start` (SSR) or static export                           |
| Node version    | `>=20.9.0` (enforced in `package.json` engines)               |
| CI/CD           | Not configured                                                |
| Monitoring      | Not configured                                                |

The app is a candidate for fully static export since all pages are client-rendered (`"use client"`).

---

## 7. SECURITY CONSIDERATIONS

| Area                    | Status                                                      |
| ----------------------- | ----------------------------------------------------------- |
| Authentication          | N/A — no user accounts or server-side state                 |
| Data transmission       | N/A — all processing is local; no data leaves the browser   |
| File input validation   | MIME type checks (`image/*`, `video/*`) on upload            |
| Image dimension limits  | Downscaled to max 2000px (images) / 800px (animation frames)|
| Frame count limits      | Capped at 120 frames to prevent memory exhaustion            |
| XSS surface             | Minimal — no user-generated HTML is rendered; hex color input is regex-validated (`/^#[0-9a-fA-F]{0,6}$/`) |

---

## 8. DEVELOPMENT & TESTING

### Local Setup

```bash
# Prerequisites: Node.js >= 20.9.0
npm install
npm run dev          # Starts dev server at http://localhost:3000
```

### Available Scripts

| Script       | Command         | Purpose                    |
| ------------ | --------------- | -------------------------- |
| `dev`        | `next dev`      | Development server with HMR |
| `build`      | `next build`    | Production build            |
| `start`      | `next start`    | Serve production build      |
| `lint`       | `eslint`        | Run ESLint                  |

### Code Quality Tools

| Tool              | Config                 | Purpose                  |
| ----------------- | ---------------------- | ------------------------ |
| TypeScript        | `tsconfig.json` (strict) | Static type checking   |
| ESLint            | `eslint.config.mjs`   | Linting (Next.js config) |
| Tailwind CSS v4   | `postcss.config.mjs`  | Utility-first CSS        |

### Testing

No test framework is currently configured.

---

## 9. FUTURE CONSIDERATIONS

### Known Technical Debt
- `use-image-upload.ts` is a legacy hook, superseded by `use-media-upload.ts` — candidate for removal.
- GIF frame extraction falls back to single-frame rendering in browsers without `ImageDecoder` API support.
- ASCII conversion runs synchronously on the main thread; large images or many animation frames can cause UI jank.

### Potential Improvements
- Web Worker for ASCII conversion to avoid blocking the main thread.
- Text/SVG export formats alongside PNG.
- Animation export (GIF/MP4 output of ASCII animation).
- Test suite (Vitest or Playwright for visual regression).
- PWA support for offline usage.

---

## 10. GLOSSARY

| Term             | Definition                                                                  |
| ---------------- | --------------------------------------------------------------------------- |
| ASCII Art        | Visual art composed of printable text characters arranged in a grid          |
| Charset          | Ordered string of characters used to represent luminance levels (dark→light) |
| Columns          | Number of character columns in the ASCII output (controls resolution)        |
| Cell             | A rectangular pixel region of the source image mapped to one ASCII character |
| Luminance        | Perceived brightness of a pixel, computed as `0.299R + 0.587G + 0.114B`      |
| Monochrome mode  | All characters rendered in a single foreground color                          |
| Colored mode     | Each character colored with the average RGB of its source cell                |
| Frame extraction | Process of decoding individual frames from a GIF or video file               |
| Fit scale        | Zoom level that makes the entire ASCII output visible within the preview area |

---

## 11. PROJECT IDENTIFICATION

| Field              | Value                                                   |
| ------------------ | ------------------------------------------------------- |
| Project name       | ASCII Art Converter (`ascii-app`)                       |
| Repository         | `git@github.com:luisson10/ASCII-backgrounds.git`        |
| Primary contact    | luisson10 (GitHub)                                       |
| Last updated       | 2026-03-20                                               |