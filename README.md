# Reference Overlay — Figma Plugin

Stop switching tabs. Your references and PRDs, right inside Figma.

## What it does

Reference Overlay keeps everything you need visible in a floating panel — right inside Figma, always on screen, independent of the canvas. No more jumping between your browser, your design, and your PRD.

### Images

- Upload PNG, JPG, or SVG reference images
- Zoom (10–500%) and pan around freely
- Pick colors directly from any reference image
- Toggle grayscale mode
- Compare two references side-by-side
- Focus mode — hides all controls for a distraction-free view

### Documents

- Upload PRDs and specs as PDF, DOCX, HTML, Markdown, or plain text
- Read through user stories and requirements as you design
- Adjustable font size for comfortable reading
- Preserves document formatting (headings, lists, tables, code blocks)

### General

- Dark and light theme support
- Persistent storage — your references and documents are saved between sessions
- Tooltips on every control
- Keyboard shortcut: `Esc` to toggle focus mode or exit color picker

## Project Structure

```
├── manifest.json              # Figma plugin manifest
├── src/
│   ├── main.ts                # Plugin controller (Figma sandbox)
│   └── ui/
│       ├── index.html         # HTML entry point
│       ├── main.tsx           # React mount
│       ├── App.tsx            # Main UI (images, toolbar, tabs)
│       ├── DocPanel.tsx       # Document viewer panel
│       ├── docParsers.ts      # PDF, DOCX, Markdown, HTML parsers
│       ├── types.ts           # TypeScript interfaces
│       └── styles.css         # Styles (dark/light themes)
├── dist/                      # Build output
│   ├── main.js
│   └── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.main.json
├── tsconfig.ui.json
└── package.json
```

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

This runs type checking, then builds:
1. The React UI → `dist/index.html` (single-file inline bundle)
2. The plugin controller → `dist/main.js`

## Load in Figma

1. Open Figma Desktop
2. Go to **Plugins → Development → Import plugin from manifest...**
3. Select the `manifest.json` file in this project root
4. Run from **Plugins → Development → Reference Overlay**

## Development

```bash
npm run dev
```

Watches for changes and rebuilds automatically. Reload the plugin in Figma after each rebuild.

## Publish

1. Open Figma Desktop
2. Go to **Plugins → Manage plugins**
3. Click **Publish new plugin** and select this project's `manifest.json`
4. Figma will assign a unique plugin ID automatically
5. Fill in the listing details and submit for review

### Suggested listing copy

**Tagline:** Stop switching tabs. Your references and PRDs, right inside Figma.

**Description:**

No more jumping between your browser, your design, and your PRD. Reference Overlay keeps everything you need visible in a floating panel — right inside Figma, always on screen, independent of the canvas.

Upload reference images or PRD documents and view them without ever leaving your workspace.

**Images** — Upload PNG, JPG, or SVG files. Zoom in, pan around, toggle grayscale, and pick colors directly from your references. Switch between multiple images with thumbnails, or compare two side-by-side.

**Documents** — Upload your PRD as PDF, DOCX, HTML, Markdown, or plain text. Read through user stories and requirements as you design, with adjustable font size for comfortable reading.

**Built for focus** — Use Focus mode to maximize your reference. Toggle between dark and light themes. Everything persists between sessions so you pick up right where you left off.
