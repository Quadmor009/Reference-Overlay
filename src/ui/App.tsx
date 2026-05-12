import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import type { ReferenceImage, Document, Note, Project } from "./types";
import DocPanel from "./DocPanel";

function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tooltip-wrap">
      {children}
      <span className="tooltip-label">{label}</span>
    </div>
  );
}

const EYEDROPPER_PATH = "M13.354 2.646a2.5 2.5 0 0 0-3.536 0L8.11 4.354l-.708-.708a.5.5 0 0 0-.707 0L5.988 4.354a.5.5 0 0 0 0 .707l.353.354L2.146 9.61a.5.5 0 0 0-.146.354v3.182a.5.5 0 0 0 .5.5H5.682a.5.5 0 0 0 .354-.146l4.195-4.196.354.354a.5.5 0 0 0 .707 0l.708-.708a.5.5 0 0 0 0-.707l-.708-.708 1.708-1.707a2.5 2.5 0 0 0 0-3.536zM5.475 12.646H3V10.17l4.196-4.195 2.474 2.475-4.195 4.196z";

const EYEDROPPER_CURSOR_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">` +
  `<path d="${EYEDROPPER_PATH}" fill="white" stroke="black" stroke-width="0.6"/>` +
  `</svg>`
);
const EYEDROPPER_CURSOR = `url("data:image/svg+xml,${EYEDROPPER_CURSOR_SVG}") 2 15, crosshair`;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// --- Icon components ---
function EyedropperIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d={EYEDROPPER_PATH} />
    </svg>
  );
}

function GrayscaleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="M14 10l7-7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

type Tab = "images" | "docs" | "notes";

// --- Main App ---
export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("images");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const notesSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [pickMode, setPickMode] = useState(false);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived: current project
  const project = projects.find((p) => p.id === activeProjectId) ?? null;
  const references = project?.references ?? [];
  const documents = project?.documents ?? [];
  const notes = project?.notes ?? [];

  const active = references.find((r) => r.id === activeId) ?? null;
  const compareRefImg = references.find((r) => r.id === compareId) ?? null;

  // --- Persistence helpers ---
  const saveProjects = useCallback((next: Project[]) => {
    parent.postMessage({ pluginMessage: { type: "save-projects", payload: next } }, "*");
  }, []);

  const updateCurrentProject = useCallback(
    (updater: (p: Project) => Project) => {
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === activeProjectId ? updater(p) : p));
        saveProjects(next);
        return next;
      });
    },
    [activeProjectId, saveProjects]
  );

  // --- Load projects on mount ---
  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: "load-projects" } }, "*");
    const handler = (e: MessageEvent) => {
      const msg = e.data?.pluginMessage;
      if (!msg) return;
      if (msg.type === "loaded-projects" && Array.isArray(msg.payload)) {
        const loaded: Project[] = msg.payload;
        setProjects(loaded);
        if (loaded.length > 0) {
          setActiveProjectId(loaded[0].id);
          if (loaded[0].references.length > 0) {
            setActiveId(loaded[0].references[0].id);
          }
          if (loaded[0].notes.length > 0) {
            setActiveNoteId(loaded[0].notes[0].id);
          }
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Reset tab-level active IDs when switching projects
  const switchProject = useCallback((id: string) => {
    setActiveProjectId(id);
    setCompareMode(false);
    setCompareId(null);
    setPickMode(false);
    setPickedColor(null);
    setFocusMode(false);
    const p = projects.find((pr) => pr.id === id);
    setActiveId(p?.references[0]?.id ?? null);
    setActiveNoteId(p?.notes[0]?.id ?? null);
  }, [projects]);

  // --- Project CRUD ---
  const addProject = useCallback(() => {
    const newProject: Project = {
      id: generateId(),
      name: "New Project",
      references: [],
      documents: [],
      notes: [{ id: generateId(), title: "Notes", content: "" }],
    };
    setProjects((prev) => {
      const next = [...prev, newProject];
      saveProjects(next);
      return next;
    });
    setActiveProjectId(newProject.id);
    setActiveId(null);
    setActiveNoteId(newProject.notes[0].id);
    setProjectMenuOpen(false);
  }, [saveProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      if (prev.length <= 1) return prev; // can't delete last project
      const next = prev.filter((p) => p.id !== id);
      if (activeProjectId === id) {
        setActiveProjectId(next[0]?.id ?? null);
        setActiveId(next[0]?.references[0]?.id ?? null);
        setActiveNoteId(next[0]?.notes[0]?.id ?? null);
      }
      saveProjects(next);
      return next;
    });
  }, [activeProjectId, saveProjects]);

  const startRename = useCallback((id: string, currentName: string) => {
    setRenamingProjectId(id);
    setRenameValue(currentName);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingProjectId || !renameValue.trim()) {
      setRenamingProjectId(null);
      return;
    }
    setProjects((prev) => {
      const next = prev.map((p) =>
        p.id === renamingProjectId ? { ...p, name: renameValue.trim() } : p
      );
      saveProjects(next);
      return next;
    });
    setRenamingProjectId(null);
  }, [renamingProjectId, renameValue, saveProjects]);

  // --- References (images) ---
  const updateReferences = useCallback(
    (updater: (prev: ReferenceImage[]) => ReferenceImage[]) => {
      updateCurrentProject((p) => ({ ...p, references: updater(p.references) }));
    },
    [updateCurrentProject]
  );

  const handleUpload = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newRef: ReferenceImage = {
          id: generateId(),
          name: file.name,
          dataUrl: reader.result as string,
          grayscale: false,
          zoom: 100,
          fitWidthOnFirstView: true,
        };
        updateReferences((prev) => {
          setActiveId(newRef.id);
          return [...prev, newRef];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const deleteRef = (id: string) => {
    updateReferences((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      if (compareId === id) setCompareId(null);
      return next;
    });
  };

  const updateField = (id: string, field: keyof ReferenceImage, value: number | boolean | string) => {
    const v = field === "zoom" && typeof value === "number" ? Math.ceil(value) : value;
    updateReferences((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: v } : r)));
  };

  // --- Documents ---
  const handleDocumentsChange = useCallback((docs: Document[]) => {
    updateCurrentProject((p) => ({ ...p, documents: docs }));
  }, [updateCurrentProject]);

  // --- Notes ---
  const handleNotesChange = useCallback((id: string, content: string) => {
    updateCurrentProject((p) => {
      const next = p.notes.map((n) => (n.id === id ? { ...n, content } : n));
      return { ...p, notes: next };
    });
  }, [updateCurrentProject]);

  const handleNoteTitleChange = useCallback((id: string, title: string) => {
    updateCurrentProject((p) => ({
      ...p,
      notes: p.notes.map((n) => (n.id === id ? { ...n, title } : n)),
    }));
  }, [updateCurrentProject]);

  const addNote = useCallback(() => {
    const newNote: Note = { id: generateId(), title: "New note", content: "" };
    updateCurrentProject((p) => ({ ...p, notes: [...p.notes, newNote] }));
    setActiveNoteId(newNote.id);
  }, [updateCurrentProject]);

  const deleteNote = useCallback((id: string) => {
    updateCurrentProject((p) => {
      const next = p.notes.filter((n) => n.id !== id);
      if (activeNoteId === id) setActiveNoteId(next[0]?.id ?? null);
      return { ...p, notes: next };
    });
  }, [updateCurrentProject, activeNoteId]);

  // --- Color picker ---
  const handleColorPick = (hex: string) => {
    setPickedColor(hex);
    setCopied(false);
  };

  const copyColor = () => {
    if (!pickedColor) return;
    navigator.clipboard.writeText(pickedColor).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // --- Keyboard ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pickMode) setPickMode(false);
        else if (focusMode) setFocusMode(false);
        else if (projectMenuOpen) setProjectMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pickMode, focusMode, projectMenuOpen]);

  // Close project menu on outside click
  useEffect(() => {
    if (!projectMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".project-bar")) {
        setProjectMenuOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [projectMenuOpen]);

  const themeClass = darkMode ? "theme-dark" : "theme-light";

  // --- Focus mode ---
  if (focusMode) {
    return (
      <div className={`focus-view ${themeClass}`}>
        {active ? (
          <ImagePreview ref_={active} pickMode={false} onColorPick={() => {}} onZoomChange={(z) => updateField(active.id, "zoom", z)} onFitWidthApplied={() => updateField(active.id, "fitWidthOnFirstView", false)} />
        ) : (
          <div className="empty-state-focus">No references</div>
        )}
        <Tooltip label="Show controls">
          <button className="focus-restore-btn" onClick={() => setFocusMode(false)}>
            <RestoreIcon />
          </button>
        </Tooltip>
      </div>
    );
  }

  // --- Full UI ---
  return (
    <div className={`plugin-root ${themeClass}`}>
      {/* Project bar */}
      <div className="project-bar">
        <button
          className="project-selector"
          onClick={() => setProjectMenuOpen((o) => !o)}
          title={project?.name ?? "Select project"}
        >
          <FolderIcon />
          <span className="project-name">{project?.name ?? "No project"}</span>
          <span className="project-chevron">▾</span>
        </button>

        {projectMenuOpen && (
          <div className="project-menu">
            {projects.map((p) => (
              <div
                key={p.id}
                className={`project-menu-item ${p.id === activeProjectId ? "project-menu-item-active" : ""}`}
              >
                {renamingProjectId === p.id ? (
                  <input
                    ref={renameInputRef}
                    className="project-rename-input"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setRenamingProjectId(null);
                    }}
                  />
                ) : (
                  <span
                    className="project-menu-label"
                    onClick={() => {
                      switchProject(p.id);
                      setProjectMenuOpen(false);
                    }}
                  >
                    {p.name}
                  </span>
                )}
                <div className="project-menu-actions">
                  <button
                    className="project-menu-btn"
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(p.id, p.name);
                    }}
                  >
                    ✎
                  </button>
                  {projects.length > 1 && (
                    <button
                      className="project-menu-btn project-menu-btn-danger"
                      title="Delete project"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(p.id);
                      }}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button className="project-menu-add" onClick={addProject}>
              + New Project
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          {tab === "images" && (
            <>
              <Tooltip label="Pick color">
                <button
                  className={`tool-btn ${pickMode ? "tool-btn-active" : ""}`}
                  onClick={() => setPickMode((p) => !p)}
                >
                  <EyedropperIcon />
                </button>
              </Tooltip>
              {active && (
                <Tooltip label="Grayscale">
                  <button
                    className={`tool-btn ${active.grayscale ? "tool-btn-active" : ""}`}
                    onClick={() => updateField(active.id, "grayscale", !active.grayscale)}
                  >
                    <GrayscaleIcon />
                  </button>
                </Tooltip>
              )}
              {references.length >= 2 && (
                <Tooltip label="Compare">
                  <button
                    className={`tool-btn ${compareMode ? "tool-btn-active" : ""}`}
                    onClick={() => {
                      const next = !compareMode;
                      setCompareMode(next);
                      if (!next) setCompareId(null);
                      else {
                        const other = references.find((r) => r.id !== activeId);
                        if (other) setCompareId(other.id);
                      }
                    }}
                  >
                    <CompareIcon />
                  </button>
                </Tooltip>
              )}
            </>
          )}
        </div>
        <div className="toolbar-group">
          <Tooltip label={darkMode ? "Light mode" : "Dark mode"}>
            <button className="tool-btn" onClick={() => setDarkMode((d) => !d)}>
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </Tooltip>
          {tab === "images" && (
            <Tooltip label="Focus mode">
              <button className="tool-btn" onClick={() => setFocusMode(true)}>
                <FocusIcon />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === "images" ? "tab-btn-active" : ""}`}
          onClick={() => setTab("images")}
        >
          Images
        </button>
        <button
          className={`tab-btn ${tab === "docs" ? "tab-btn-active" : ""}`}
          onClick={() => setTab("docs")}
        >
          Docs
        </button>
        <button
          className={`tab-btn ${tab === "notes" ? "tab-btn-active" : ""}`}
          onClick={() => setTab("notes")}
        >
          Notes
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content-wrap">
      <div className={tab === "images" ? "tab-pane" : "tab-pane tab-pane-hidden"}>
        <div className="thumbnail-strip">
            {references.map((ref) => (
              <div
                key={ref.id}
                role="button"
                tabIndex={0}
                className={`thumb ${ref.id === activeId ? "thumb-active" : ""} ${
                  compareMode && ref.id === compareId ? "thumb-compare" : ""
                }`}
                onClick={() => {
                  if (compareMode && activeId !== ref.id) {
                    setCompareId(ref.id === compareId ? null : ref.id);
                  } else {
                    setActiveId(ref.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (compareMode && activeId !== ref.id) {
                      setCompareId(ref.id === compareId ? null : ref.id);
                    } else {
                      setActiveId(ref.id);
                    }
                  }
                }}
                title={ref.name}
              >
                {ref.id === activeId && (
                  <button
                    type="button"
                    className="thumb-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRef(ref.id);
                    }}
                    aria-label="Remove image"
                    title="Remove"
                  >
                    <CloseIcon />
                  </button>
                )}
                <img src={ref.dataUrl} alt={ref.name} />
              </div>
            ))}
            <Tooltip label="Add image">
              <button className="thumb thumb-add" onClick={handleUpload}>
                +
              </button>
            </Tooltip>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            multiple
            onChange={onFileChange}
            style={{ display: "none" }}
          />

          <div className="preview-area">
            {compareMode && active && compareRefImg ? (
              <div className="compare-container">
                <ImagePreview ref_={active} pickMode={pickMode} onColorPick={handleColorPick} onZoomChange={(z) => updateField(active.id, "zoom", z)} onFitWidthApplied={() => updateField(active.id, "fitWidthOnFirstView", false)} />
                <div className="compare-divider" />
                <ImagePreview ref_={compareRefImg} pickMode={pickMode} onColorPick={handleColorPick} onZoomChange={(z) => updateField(compareRefImg.id, "zoom", z)} onFitWidthApplied={() => updateField(compareRefImg.id, "fitWidthOnFirstView", false)} />
              </div>
            ) : active ? (
              <ImagePreview ref_={active} pickMode={pickMode} onColorPick={handleColorPick} onZoomChange={(z) => updateField(active.id, "zoom", z)} onFitWidthApplied={() => updateField(active.id, "fitWidthOnFirstView", false)} />
            ) : (
              <div className="empty-state" onClick={handleUpload}>
                <UploadIcon />
                <p>Upload a reference</p>
                <p className="hint">PNG, JPG, or SVG</p>
              </div>
            )}

            {pickedColor && (
              <div className="color-pill" onClick={copyColor}>
                <div className="color-pill-swatch" style={{ background: pickedColor }} />
                <span className="color-pill-hex">{pickedColor.toUpperCase()}</span>
                <span className="color-pill-action">{copied ? "Copied!" : "Copy"}</span>
              </div>
            )}
          </div>

          {active && (
            <div className="bottom-bar">
              <Tooltip label="Zoom out">
                <button
                  className="zoom-btn"
                  onClick={() => updateField(active.id, "zoom", Math.ceil(Math.max(10, active.zoom - 25)))}
                  aria-label="Zoom out"
                >
                  −
                </button>
              </Tooltip>
              <input
                className="zoom-slider"
                type="range"
                min={10}
                max={500}
                value={active.zoom}
                onChange={(e) => updateField(active.id, "zoom", Math.ceil(Number(e.target.value)))}
              />
              <Tooltip label="Zoom in">
                <button
                  className="zoom-btn"
                  onClick={() => updateField(active.id, "zoom", Math.ceil(Math.min(500, active.zoom + 25)))}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </Tooltip>
              <span className="zoom-value">{Math.ceil(active.zoom)}%</span>
            </div>
          )}
      </div>
      <div className={tab === "docs" ? "tab-pane" : "tab-pane tab-pane-hidden"}>
        <DocPanel documents={documents} onDocumentsChange={handleDocumentsChange} />
      </div>
      <div className={tab === "notes" ? "tab-pane" : "tab-pane tab-pane-hidden"}>
        <div className="notes-panel">
          <div className="notes-strip">
            {notes.map((note) => (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                className={`note-chip ${note.id === activeNoteId ? "note-chip-active" : ""}`}
                onClick={() => setActiveNoteId(note.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveNoteId(note.id);
                  }
                }}
                title={note.title}
              >
                <span className="note-chip-title">{note.title}</span>
                {notes.length > 1 && note.id === activeNoteId && (
                  <button
                    type="button"
                    className="note-chip-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    aria-label="Remove note"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            ))}
            <button className="note-chip note-chip-add" onClick={addNote} title="Add note">
              +
            </button>
          </div>
          {activeNoteId ? (
            (() => {
              const activeNote = notes.find((n) => n.id === activeNoteId);
              return activeNote ? (
                <div className="notes-editor">
                  <input
                    type="text"
                    className="notes-title-input"
                    placeholder="Subject"
                    value={activeNote.title}
                    onChange={(e) => handleNoteTitleChange(activeNote.id, e.target.value)}
                  />
                  <textarea
                    className="notes-textarea"
                    placeholder="Jot down notes, reminders, or quick reference..."
                    value={activeNote.content}
                    onChange={(e) => handleNotesChange(activeNote.id, e.target.value)}
                  />
                </div>
              ) : null;
            })()
          ) : (
            <div className="notes-empty" onClick={addNote}>
              <p>No notes yet</p>
              <p className="hint">Click + to add a note</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

// --- Image Preview ---
interface ImagePreviewProps {
  ref_: ReferenceImage;
  pickMode: boolean;
  onColorPick: (hex: string) => void;
  onZoomChange?: (newZoom: number) => void;
  onFitWidthApplied?: () => void;
}

function ImagePreview({ ref_, pickMode, onColorPick, onZoomChange, onFitWidthApplied }: ImagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [ref_.id]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvasRef.current = canvas;
      }
      imgElRef.current = img;
    };
    img.src = ref_.dataUrl;
  }, [ref_.dataUrl]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    didDrag.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasDragging = didDrag.current;
    dragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
    if (pickMode && !wasDragging) pickColorAt(e.clientX, e.clientY);
  };

  const pickColorAt = (clientX: number, clientY: number) => {
    if (!canvasRef.current || !containerRef.current || !imgElRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = ref_.zoom / 100;
    const imgW = imgElRef.current.naturalWidth;
    const imgH = imgElRef.current.naturalHeight;
    const centerX = rect.width / 2 + pan.x;
    const centerY = rect.height / 2 + pan.y;
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const imgX = Math.round((clickX - centerX) / scale + imgW / 2);
    const imgY = Math.round((clickY - centerY) / scale + imgH / 2);
    if (imgX < 0 || imgX >= imgW || imgY < 0 || imgY >= imgH) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(imgX, imgY, 1, 1).data;
    onColorPick(rgbToHex(pixel[0], pixel[1], pixel[2]));
  };

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!onZoomChange) return;
    const delta = e.deltaY > 0 ? -5 : 5;
    const newZoom = Math.ceil(Math.max(10, Math.min(500, ref_.zoom + delta)));
    onZoomChange(newZoom);
  }, [ref_.zoom, onZoomChange]);

  const tryApplyFitWidth = useCallback(() => {
    if (!ref_.fitWidthOnFirstView || !onZoomChange || !onFitWidthApplied || !containerRef.current) return;
    const img = containerRef.current.querySelector("img");
    if (!img?.naturalWidth) return;
    const containerW = containerRef.current.getBoundingClientRect().width;
    if (containerW <= 0) return;
    const zoom = Math.ceil(Math.max(10, Math.min(500, (containerW / img.naturalWidth) * 100)));
    onZoomChange(zoom);
    onFitWidthApplied();
  }, [ref_.fitWidthOnFirstView, onZoomChange, onFitWidthApplied]);

  const onImageLoad = useCallback(() => {
    tryApplyFitWidth();
  }, [tryApplyFitWidth]);

  useEffect(() => {
    if (!ref_.fitWidthOnFirstView || !onZoomChange || !onFitWidthApplied) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => tryApplyFitWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref_.fitWidthOnFirstView, ref_.id, onZoomChange, onFitWidthApplied, tryApplyFitWidth]);

  const scale = ref_.zoom / 100;

  return (
    <div
      ref={containerRef}
      className="image-preview"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
      style={{ cursor: pickMode ? EYEDROPPER_CURSOR : "grab" }}
    >
      <img
        src={ref_.dataUrl}
        alt={ref_.name}
        draggable={false}
        onLoad={onImageLoad}
        style={{
          filter: ref_.grayscale ? "grayscale(100%)" : "none",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
