import * as pdfjsLib from "pdfjs-dist";
// @ts-expect-error - Vite raw import of the worker source to inline it
import pdfjsWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?raw";
import mammoth from "mammoth";
import { marked } from "marked";

// Create a blob URL from the inlined worker source so PDF.js can use it
const workerBlob = new Blob([pdfjsWorkerSrc], { type: "text/javascript" });
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);

interface PdfTextItem {
  str: string;
  transform: number[];
  height: number;
  fontName: string;
}

export async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const items = content.items
      .filter((item) => "str" in item && (item as { str: string }).str.length > 0)
      .map((item) => item as unknown as PdfTextItem);

    if (items.length === 0) continue;

    // Group items into lines by Y position
    const lines: { y: number; height: number; texts: string[]; fontName: string }[] = [];
    let currentLine = {
      y: items[0].transform[5],
      height: items[0].height,
      texts: [items[0].str],
      fontName: items[0].fontName,
    };

    for (let j = 1; j < items.length; j++) {
      const item = items[j];
      const y = item.transform[5];
      const yDiff = Math.abs(y - currentLine.y);

      // Same line if Y position is very close
      if (yDiff < currentLine.height * 0.5) {
        currentLine.texts.push(item.str);
        if (item.height > currentLine.height) {
          currentLine.height = item.height;
          currentLine.fontName = item.fontName;
        }
      } else {
        lines.push(currentLine);
        currentLine = {
          y,
          height: item.height,
          texts: [item.str],
          fontName: item.fontName,
        };
      }
    }
    lines.push(currentLine);

    // Compute the most common font height to identify body text
    const heightCounts = new Map<number, number>();
    for (const line of lines) {
      const h = Math.round(line.height);
      heightCounts.set(h, (heightCounts.get(h) || 0) + 1);
    }
    let bodyHeight = 0;
    let maxCount = 0;
    for (const [h, count] of heightCounts) {
      if (count > maxCount) {
        bodyHeight = h;
        maxCount = count;
      }
    }

    // Build HTML from lines, detecting headings and paragraph breaks
    const htmlParts: string[] = [];
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      const text = escapeHtml(line.texts.join(" ").trim());
      if (!text) continue;

      const h = Math.round(line.height);
      const isBold = /bold/i.test(line.fontName);

      // Detect paragraph break: gap between this line and the previous is larger than the line height
      const prevLine = j > 0 ? lines[j - 1] : null;
      const gap = prevLine ? Math.abs(prevLine.y - line.y) : 0;
      const isNewParagraph = prevLine && gap > line.height * 1.8;

      if (h > bodyHeight + 4) {
        // Large text → heading
        const ratio = h / bodyHeight;
        if (ratio > 1.6) {
          htmlParts.push(`<h1>${text}</h1>`);
        } else if (ratio > 1.25) {
          htmlParts.push(`<h2>${text}</h2>`);
        } else {
          htmlParts.push(`<h3>${text}</h3>`);
        }
      } else if (isBold && isNewParagraph && text.length < 100) {
        htmlParts.push(`<h3>${text}</h3>`);
      } else {
        if (isNewParagraph && htmlParts.length > 0) {
          htmlParts.push(`<p>${text}</p>`);
        } else if (htmlParts.length === 0) {
          htmlParts.push(`<p>${text}</p>`);
        } else {
          // Append to previous paragraph or create continuation
          const last = htmlParts[htmlParts.length - 1];
          if (last.endsWith("</p>")) {
            htmlParts[htmlParts.length - 1] = last.slice(0, -4) + " " + text + "</p>";
          } else {
            htmlParts.push(`<p>${text}</p>`);
          }
        }
      }
    }

    pages.push(`<div class="doc-page">${htmlParts.join("\n")}</div>`);
  }

  return pages.join('<hr class="doc-page-break" />');
}

export async function parseDocx(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    {
      styleMap: [
        "p[style-name='Title'] => h1.doc-title:fresh",
        "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Quote'] => blockquote:fresh",
        "p[style-name='Intense Quote'] => blockquote:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
    }
  );
  return result.value;
}

export async function parseMarkdown(text: string): Promise<string> {
  return await marked.parse(text);
}

export function parsePlainText(text: string): string {
  return `<pre class="doc-plain">${escapeHtml(text)}</pre>`;
}

export function parseHtml(html: string): string {
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
