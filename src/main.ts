figma.showUI(__html__, {
  width: 340,
  height: 480,
  themeColors: true,
  title: "Reference Overlay",
});

figma.ui.onmessage = async (msg: { type: string; payload?: any }) => {
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
