import type { Highlight } from "@/hooks/useArticleAnnotations";

const MARK_ATTR = "data-sl-highlight";

export function clearHighlights(container: HTMLElement) {
  container.querySelectorAll(`mark[${MARK_ATTR}]`).forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

/** Paint stored highlights by matching their text inside the rendered article. */
export function paintHighlights(container: HTMLElement, highlights: Highlight[]) {
  clearHighlights(container);

  highlights.forEach((hl) => {
    const needle = hl.selectedText.replace(/\s+/g, " ").trim();
    if (needle.length < 2) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const node of nodes) {
      if (node.parentElement?.closest(`mark[${MARK_ATTR}]`)) continue;
      const text = node.nodeValue ?? "";
      const index = text.indexOf(needle);
      if (index === -1) continue;

      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + needle.length);

      const mark = document.createElement("mark");
      mark.setAttribute(MARK_ATTR, hl.id);
      mark.className = `sl-hl sl-hl-${hl.color}`;
      mark.title = "Klik untuk menghapus sorotan";
      try {
        range.surroundContents(mark);
      } catch {
        /* selection spans elements — skip */
      }
      break;
    }
  });
}