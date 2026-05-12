export interface ReferenceImage {
  id: string;
  name: string;
  dataUrl: string;
  grayscale: boolean;
  zoom: number;
  fitWidthOnFirstView?: boolean;
}

export type DocType = "pdf" | "docx" | "md" | "txt" | "html";

export interface Document {
  id: string;
  name: string;
  type: DocType;
  htmlContent: string;
  source: "upload";
}

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  references: ReferenceImage[];
  documents: Document[];
  notes: Note[];
}
