# Reference Overlay – Product Requirements Document

## Overview

**Reference Overlay** is a Figma plugin that keeps reference images, documents, and notes in a floating panel while designers work. It removes the need to zoom out, pan away, or switch tabs to view inspiration, PRDs, and quick notes.

## Problem

Designers rely on references—moodboards, screenshots, PRDs, user stories—while creating. Today they must:

- Zoom out and pan to see references, then zoom back
- Drag references onto the artboard (clutters the canvas)
- Switch browser/editor tabs to re-read PRDs or specs

This breaks flow and adds friction.

## Solution

A floating plugin panel that overlays the Figma canvas and provides:

1. **Images tab** – Upload and view reference images
2. **Docs tab** – Upload and view documents (PRDs, specs, markdown)
3. **Notes tab** – Quick notes and reminders

References stay visible and accessible without leaving the canvas.

---

## Features

### Images tab

- Upload PNG, JPEG, SVG
- Multiple images with thumbnail strip
- Zoom (slider, +/−, scroll/pinch); values displayed as whole numbers
- Pan/drag
- Fit-to-width on first view for new uploads
- Grayscale toggle
- Compare mode (side-by-side)
- Color picker (eyedropper)
- Focus mode (full-screen image, minimal UI)
- Close/remove per image

### Docs tab

- Upload PDF, DOCX, HTML, Markdown, plain text
- Multiple documents with chip strip
- Scrollable viewer with font-size control
- Preserves document formatting
- Close/remove per document

### Notes tab

- Single textarea for quick notes
- Auto-save (debounced)
- Persists across sessions

### Shared

- Dark/light mode
- Scroll position preserved when switching tabs
- Horizontal scrolling for thumbnails/chips when many items
- ESC: exit pick mode or focus mode

---

## User stories

- As a product designer, I can view the PRD in the plugin while implementing designs, so I don’t have to switch tabs.
- As a UI designer, I can compare two reference screenshots side by side.
- As a designer, I can jot down notes and reminders while designing, without leaving Figma.
- As a designer, I can pick colors from reference images directly in the plugin.

---

## Technical constraints

- Figma plugin API; no network access
- Data stored in `figma.clientStorage`
- Plugin UI: React, bundled into a single HTML file
- Doc parsing runs client-side (pdfjs-dist, mammoth, marked)

---

## Out of scope (current version)

- Search within documents
- Annotations on images
- Syncing notes to external tools
- Image editing (crop, rotate)
