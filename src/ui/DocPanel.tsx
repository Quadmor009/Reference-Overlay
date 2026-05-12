import { useState, useEffect, useRef, useCallback } from "react";
import type { Document, DocType } from "./types";
import {
  parsePdf,
  parseDocx,
  parseMarkdown,
  parsePlainText,
  parseHtml,
} from "./docParsers";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getDocType(filename: string): DocType | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "txt") return "txt";
  if (ext === "html" || ext === "htm") return "html";
  return null;
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface DocPanelProps {
  documents: Document[];
  onDocumentsChange: (docs: Document[]) => void;
}

export default function DocPanel({ documents, onDocumentsChange }: DocPanelProps) {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = useCallback((msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setError(msg);
    errorTimerRef.current = setTimeout(() => setError(null), 10000);
  }, []);

  const dismissError = useCallback(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setError(null);
  }, []);

  const activeDoc = documents.find((d) => d.id === activeDocId) ?? null;

  // Auto-select first doc
  useEffect(() => {
    if (!activeDoc && documents.length > 0) {
      setActiveDocId(documents[0].id);
    }
  }, [documents, activeDoc]);

  const addDocument = useCallback(
    (doc: Document) => {
      const next = [...documents, doc];
      onDocumentsChange(next);
      setActiveDocId(doc.id);
    },
    [documents, onDocumentsChange]
  );

  const deleteDoc = (id: string) => {
    const next = documents.filter((d) => d.id !== id);
    onDocumentsChange(next);
    if (activeDocId === id) setActiveDocId(next[0]?.id ?? null);
  };

  const handleUpload = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const docType = getDocType(file.name);
      if (!docType) {
        showError(`Unsupported file type: ${file.name}. Try PDF, DOCX, HTML, Markdown, or plain text.`);
        continue;
      }

      setLoading(true);
      dismissError();

      try {
        let htmlContent: string;

        if (docType === "pdf") {
          const buffer = await file.arrayBuffer();
          htmlContent = await parsePdf(buffer);
        } else if (docType === "docx") {
          const buffer = await file.arrayBuffer();
          htmlContent = await parseDocx(buffer);
        } else if (docType === "html") {
          const text = await file.text();
          htmlContent = parseHtml(text);
        } else if (docType === "md") {
          const text = await file.text();
          htmlContent = await parseMarkdown(text);
        } else {
          const text = await file.text();
          htmlContent = parsePlainText(text);
        }

        addDocument({
          id: generateId(),
          name: file.name,
          type: docType,
          htmlContent,
          source: "upload",
        });
      } catch (err) {
        showError(`Could not read ${file.name}. ${err instanceof Error ? err.message : "The file may be corrupted or unsupported."}`);
      } finally {
        setLoading(false);
      }
    }

    e.target.value = "";
  };

  return (
    <div className="doc-panel">
      {/* Doc strip */}
      <div className="doc-strip">
        {documents.map((doc) => (
          <div
            key={doc.id}
            role="button"
            tabIndex={0}
            className={`doc-chip ${doc.id === activeDocId ? "doc-chip-active" : ""}`}
            onClick={() => setActiveDocId(doc.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveDocId(doc.id);
              }
            }}
            title={doc.name}
          >
            <span className="doc-chip-type">{doc.type.toUpperCase()}</span>
            <span className="doc-chip-name">{doc.name}</span>
            <button
              type="button"
              className="doc-chip-close"
              onClick={(e) => {
                e.stopPropagation();
                deleteDoc(doc.id);
              }}
              aria-label="Remove document"
            >
              <CloseIcon />
            </button>
          </div>
        ))}
        <button className="doc-chip doc-chip-add" onClick={handleUpload} title="Upload document">
          +
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.md,.markdown,.txt,.html,.htm"
          multiple
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Error / loading */}
      {error && (
        <div className="doc-error">
          <span>{error}</span>
          <button className="doc-error-dismiss" onClick={dismissError}>×</button>
        </div>
      )}
      {loading && <div className="doc-loading">Loading...</div>}

      {/* Document viewer */}
      <div className="doc-viewer" style={{ fontSize: `${fontSize}px` }}>
        {activeDoc ? (
          <div
            className="doc-content"
            dangerouslySetInnerHTML={{ __html: activeDoc.htmlContent }}
          />
        ) : (
          <div className="doc-empty" onClick={handleUpload}>
            <p>Upload a PRD or document</p>
            <p className="hint">PDF, DOCX, HTML, Markdown, or plain text</p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {activeDoc && (
        <div className="doc-bottom-bar">
          <span className="doc-font-label">A</span>
          <input
            className="zoom-slider"
            type="range"
            min={10}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <span className="doc-font-label doc-font-label-large">A</span>
        </div>
      )}
    </div>
  );
}
