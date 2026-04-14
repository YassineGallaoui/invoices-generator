/**
 * Strict allowlist HTML sanitizer for the Notes rich-text field.
 * Allowed tags: b, strong, i, em, u, br, p, ul, ol, li.
 * No attributes are allowed. Runs client-side only.
 */
const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "br",
  "p",
  "ul",
  "ol",
  "li",
]);

export function sanitizeHtml(html: string): string {
  if (import.meta.server) return "";

  const template = document.createElement("template");
  template.innerHTML = html;
  walkAndSanitize(template.content);
  const div = document.createElement("div");
  div.appendChild(template.content.cloneNode(true));
  return div.innerHTML;
}

function walkAndSanitize(node: Node): void {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();

      if (tag === "div") {
        // Chrome creates <div> for line separators in contenteditable.
        // Promote to <p> so it is preserved and renders as a block in both
        // the preview (v-html) and the PDF converter.
        const p = document.createElement("p");
        while (el.firstChild) p.appendChild(el.firstChild);
        node.replaceChild(p, el);
        walkAndSanitize(p);
      } else if (!ALLOWED_TAGS.has(tag)) {
        // Replace disallowed element with its text content
        const text = document.createTextNode(el.textContent ?? "");
        node.replaceChild(text, child);
      } else {
        // Strip all attributes from allowed elements
        Array.from(el.attributes).forEach((attr) =>
          el.removeAttribute(attr.name),
        );
        walkAndSanitize(el);
      }
    }
  }
}
