figma.showUI(__html__, {
  width: 340,
  height: 480,
  themeColors: true,
  title: "Reference Overlay",
});

figma.ui.onmessage = async (msg: { type: string; payload?: any }) => {
  // --- Projects ---
  if (msg.type === "load-projects") {
    let projects = await figma.clientStorage.getAsync("projects");

    // Migrate legacy flat data into a default project on first load
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      const legacyRefs = (await figma.clientStorage.getAsync("references")) || [];
      const legacyDocs = (await figma.clientStorage.getAsync("documents")) || [];
      let legacyNotes = (await figma.clientStorage.getAsync("notes")) || [];
      // Handle old single-string notes format
      if (typeof legacyNotes === "string") {
        legacyNotes = legacyNotes
          ? [{ id: Date.now().toString(36), title: "Notes", content: legacyNotes }]
          : [];
      }
      if (!Array.isArray(legacyNotes)) legacyNotes = [];

      const defaultProject = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: "My Project",
        references: legacyRefs,
        documents: legacyDocs,
        notes: legacyNotes,
      };
      projects = [defaultProject];
      await figma.clientStorage.setAsync("projects", projects);
    }

    figma.ui.postMessage({ type: "loaded-projects", payload: projects });
  }

  if (msg.type === "save-projects") {
    await figma.clientStorage.setAsync("projects", msg.payload);
  }

  // --- Legacy keys (kept for backward compat, no longer primary) ---
  if (msg.type === "save-references") {
    await figma.clientStorage.setAsync("references", msg.payload);
  }

  if (msg.type === "load-references") {
    const data = await figma.clientStorage.getAsync("references");
    figma.ui.postMessage({ type: "loaded-references", payload: data || [] });
  }

  if (msg.type === "save-documents") {
    await figma.clientStorage.setAsync("documents", msg.payload);
  }

  if (msg.type === "load-documents") {
    const data = await figma.clientStorage.getAsync("documents");
    figma.ui.postMessage({ type: "loaded-documents", payload: data || [] });
  }

  if (msg.type === "save-notes") {
    await figma.clientStorage.setAsync("notes", msg.payload);
  }

  if (msg.type === "load-notes") {
    const data = await figma.clientStorage.getAsync("notes");
    figma.ui.postMessage({ type: "loaded-notes", payload: data ?? [] });
  }

  if (msg.type === "resize") {
    const { width, height } = msg.payload;
    figma.ui.resize(
      Math.max(280, Math.min(800, width)),
      Math.max(300, Math.min(900, height))
    );
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
