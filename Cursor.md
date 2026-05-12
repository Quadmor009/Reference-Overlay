# Reference Overlay – Cursor Context

## Project overview

Reference Overlay is a **Figma plugin** that lets designers keep reference images, documents, and notes in a floating panel while they work. No tab switching or panning away from the canvas.

## Tech stack

- **UI**: React 18, TypeScript
- **Build**: Vite (UI), esbuild (main plugin)
- **Styling**: Plain CSS (no Tailwind)
- **Storage**: Figma `clientStorage` (references, documents, notes)
- **Doc parsing**: pdfjs-dist, mammoth, marked

## Structure

```
src/
  main.ts          # Plugin entry; handles clientStorage load/save
  ui/
    App.tsx        # Main UI: tabs, image preview, toolbar, notes
    DocPanel.tsx   # Docs tab: document upload & viewer
    types.ts       # ReferenceImage, Document, DocType
    styles.css     # All styles
    docParsers.ts  # PDF, DOCX, MD, HTML, TXT parsers
dist/              # Built output (main.js, index.html)
manifest.json      # Figma plugin manifest
```

## Key patterns

- **State**: React `useState`; no global state manager
- **Persistence**: `parent.postMessage` to main.ts → `figma.clientStorage.setAsync`
- **Tabs**: Images, Docs, Notes; panes use `visibility: hidden` when inactive to preserve scroll
- **Zoom**: Stored per-image; always `Math.ceil` (no decimals)
- **Fit-width**: New uploads use `fitWidthOnFirstView`; applied via ResizeObserver + onLoad

## Conventions

- Minimal abstractions; logic lives in App.tsx unless reused
- CSS variables for theming (dark/light)
- No icons unless they clearly add value
- Debounce saves for notes (300ms)
