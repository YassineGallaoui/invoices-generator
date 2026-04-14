import type { Invoice } from "~/types/invoice";

// pdfmake 0.3.x ships without TypeScript types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- no @types/pdfmake available
type DocDef = Record<string, any>;

// ── HTML → pdfmake converter (for Notes) ─────────────────────────────────────
// Handles our sanitized allowlist: b, strong, i, em, u, br, p, ul, ol, li.
// Uses the browser's DOMParser — safe to call inside a button-click handler.

function parseInlineNodes(nodes: NodeListOf<ChildNode> | ChildNode[]): DocDef[] {
  const out: DocDef[] = [];
  for (const node of Array.from(nodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? "";
      if (t) out.push({ text: t });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const inner = parseInlineNodes(el.childNodes);
      if (tag === "b" || tag === "strong") {
        out.push({ text: inner.length ? inner : [{ text: el.textContent ?? "" }], bold: true });
      } else if (tag === "i" || tag === "em") {
        out.push({ text: inner.length ? inner : [{ text: el.textContent ?? "" }], italics: true });
      } else if (tag === "u") {
        out.push({ text: inner.length ? inner : [{ text: el.textContent ?? "" }], decoration: "underline" });
      } else if (tag === "br") {
        out.push({ text: "\n" });
      } else {
        out.push(...inner);
      }
    }
  }
  return out;
}

function htmlToPdfContent(html: string, basePx: number): DocDef[] {
  if (!html?.trim()) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const result: DocDef[] = [];

  for (const node of Array.from(doc.body.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent?.trim() ?? "";
      if (t) result.push({ text: t, fontSize: basePx });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();

      if (tag === "p") {
        const inline = parseInlineNodes(el.childNodes);
        result.push({
          text: inline.length ? inline : [{ text: el.textContent ?? "" }],
          fontSize: basePx,
          margin: [0, 0, 0, 3],
        });
      } else if (tag === "ul" || tag === "ol") {
        const items = Array.from(el.querySelectorAll("li")).map((li) => {
          const inline = parseInlineNodes(li.childNodes);
          return inline.length ? inline : [{ text: li.textContent ?? "" }];
        });
        result.push({ [tag]: items, fontSize: basePx, margin: [0, 0, 0, 0] });
      } else {
        // Inline element at block level — wrap it
        const inline = parseInlineNodes(el.childNodes);
        if (inline.length) result.push({ text: inline, fontSize: basePx });
      }
    }
  }

  return result;
}

// ── Table layouts (match CSS borders in the preview components) ───────────────

// Parties: solid underline after the header row only, no other borders/padding
const partiesLayout = {
  hLineWidth: (i: number) => (i === 1 ? 0.5 : 0),
  hLineColor: () => "#777777",
  vLineWidth: () => 0,
  paddingLeft:   () => 0,
  paddingRight:  () => 0,
  paddingTop:    (i: number) => (i === 0 ? 0 : 3),
  paddingBottom: (i: number) => (i === 0 ? 3 : 0),
};

// Items: header underline + dashed separators between data rows
function makeItemsLayout(dataRowCount: number) {
  return {
    hLineWidth: (i: number) => {
      if (i === 1) return 0.5;                              // header underline
      if (i >= 2 && i <= dataRowCount +1) return 0.5;       // between data rows only
      return 0;
    },
    hLineColor: (i: number) => (i === 1 ? "#777777" : "#cccccc"),
    hLineStyle: (i: number) =>
      i > 1 ? { dash: { length: 3, space: 2 } } : null, // dashed for data rows
    vLineWidth: () => 0,
    paddingLeft:   () => 0,
    paddingRight:  () => 0,
    paddingTop:    (i: number) => (i === 0 ? 0 : 3),
    paddingBottom: (i: number) => (i === 0 ? 3 : 0),
  };
}

// Parties: solid underline after the header row only, no other borders/padding
const footerLayout = {
  hLineWidth: (i: number) => (i === 1 ? 0.5 : 0),
  hLineColor: () => "#777777",
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: (i: number) => (i === 0 ? 0 : 3),
  paddingBottom: (i: number) => (i === 0 ? 3 : 0),
};
// ── Shared helpers ────────────────────────────────────────────────────────────

function formatPdfDate(iso: string, locale: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso + "T00:00:00"));
  } catch {
    return iso;
  }
}

/**
 * Inline amount: symbol + NBSP + whole + .cents at 80% — no superscript.
 * Matches the <span> approach in InvoiceItemsTable.vue.
 */
function fmtCell(n: number, currency: string, locale: string, basePx: number): DocDef[] {
  const { symbol, whole, cents } = formatAmount(n, currency, locale);
  return [
    { text: `${symbol}\u00A0${whole}`, fontSize: basePx },
    { text: `.${cents}`, fontSize: Math.round(basePx * 0.8) },
  ];
}

// ── Preheader ─────────────────────────────────────────────────────────────────

function buildPreheader(invoice: Invoice): DocDef {
  const { preheader, config } = invoice;

  const leftCell: DocDef =
    preheader.kind === "logo" && preheader.logoDataUrl
      ? { image: preheader.logoDataUrl, width: 120 }
      : { text: preheader.text || "Invoice", fontSize: config.preheaderTextPx, bold: false };

  const rightStack: DocDef[] = [];
  if (preheader.invoiceNumber) {
    rightStack.push({ text: preheader.invoiceNumber, fontSize: config.baseFontPx });
  }
  if (preheader.invoiceDate) {
    rightStack.push({
      text: formatPdfDate(preheader.invoiceDate, config.locale),
      fontSize: config.baseFontPx,
    });
  }

  return {
    table: {
      widths: ["*", "auto"], // right col shrinks to content, matching preview
      body: [[
        leftCell,
        { stack: rightStack.length ? rightStack : [{ text: "" }], alignment: "right" },
      ]],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 16],
  };
}

// ── From / To parties ─────────────────────────────────────────────────────────

function buildPartiesTable(invoice: Invoice): DocDef {
  const { from, to, config } = invoice;
  const fillProp = config.headerColor ? { fillColor: config.headerColor } : {};

  function partyStack(party: Invoice["from"]): DocDef[] {
    const stack: DocDef[] = [];
    if (party.name) {
      // margin-bottom matches preview's `padding: 0 0 0.2em` on the primary row
      stack.push({ text: party.name, fontSize: config.primaryInfoPx, bold: true, margin: [0, 0, 0, 2] });
    }
    const lines = [
      party.address1, party.address2, party.vatNumber,
      party.cf, party.email, party.phone, ...party.extra,
    ].filter(Boolean);
    if (lines.length) {
      stack.push({ text: lines.join("\n"), fontSize: config.secondaryInfoPx, lineHeight: 1.6 });
    }
    return stack.length ? stack : [{ text: "" }];
  }

  return {
    table: {
      widths: ["*", "*"],
      body: [
        [
          { text: "FROM", fontSize: config.tableHeaderPx, bold: true, ...fillProp },
          { text: "TO",   fontSize: config.tableHeaderPx, bold: true, alignment: "right", ...fillProp },
        ],
        [
          { stack: partyStack(from) },
          { stack: partyStack(to), alignment: "right" },
        ],
      ],
    },
    layout: partiesLayout,
    margin: [0, 0, 0, 16],
  };
}

// ── Items table ───────────────────────────────────────────────────────────────

function buildItemsSection(invoice: Invoice, sectionIndex: number): DocDef {
  const { config } = invoice;
  const section = invoice.items[sectionIndex]!;
  const { currency, locale, baseFontPx, tableHeaderPx } = config;
  const fillProp = config.headerColor ? { fillColor: config.headerColor } : {};
  const qtyHeader = section.unit ? `QTY (${section.unit})` : "QTY";
  const fmt = (n: number) => fmtCell(n, currency, locale, baseFontPx);

  const headerRow: DocDef[] = [
    { text: "DESCRIPTION", fontSize: tableHeaderPx, bold: true, ...fillProp },
    { text: "UNIT PRICE",  fontSize: tableHeaderPx, bold: true, alignment: "right", ...fillProp },
    { text: qtyHeader,     fontSize: tableHeaderPx, bold: true, alignment: "right", ...fillProp },
    { text: "TOTAL",       fontSize: tableHeaderPx, bold: true, alignment: "right", ...fillProp },
  ];

  const dataRows: DocDef[][] = section.items.map((item) => [
    { text: item.description, fontSize: baseFontPx },
    { text: fmt(item.unitPrice), alignment: "right" },
    { text: String(item.quantity), fontSize: baseFontPx, alignment: "right" },
    { text: fmt(item.unitPrice * item.quantity), alignment: "right" },
  ]);

  const grandTotal = section.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const spacerRow: DocDef[] = [
    { text: "", colSpan: 4, border: [false, false, false, false] }, {}, {}, {},
  ];
  const fmtTotal = (n: number) => fmtCell(n, currency, locale, config.primaryInfoPx);
  const totalRow: DocDef[] = [
    { text: "", colSpan: 3, border: [false, false, false, false] }, {}, {},
    {
      text: [{ text: "Total:\u00A0", bold: true, fontSize: config.primaryInfoPx }, ...fmtTotal(grandTotal)],
      alignment: "right",
    },
  ];

  return {
    table: {
      widths: ["*", "auto", "auto", "auto"],
      body: [headerRow, ...dataRows, spacerRow, totalRow],
    },
    layout: makeItemsLayout(dataRows.length),
    margin: [0, 0, 0, 16],
  };
}

// ── Footer: payment + notes ───────────────────────────────────────────────────

function buildFooterTable(invoice: Invoice, hMargin = 0): DocDef {
  const { payment, notesHtml, config } = invoice;
  const fillProp = config.headerColor ? { fillColor: config.headerColor } : {};

  const paymentBody: DocDef[] = [];
  if (payment.iban) {
    paymentBody.push({
      text: [{ text: "IBAN: ", bold: true }, { text: payment.iban }],
      fontSize: config.baseFontPx,
    });
  }
  if (payment.bicSwift) {
    paymentBody.push({
      text: [{ text: "BIC/SWIFT: ", bold: true }, { text: payment.bicSwift }],
      fontSize: config.baseFontPx,
    });
  }
  if (payment.extra) {
    paymentBody.push({ text: payment.extra, fontSize: config.baseFontPx });
  }

  const notesContent = htmlToPdfContent(notesHtml, config.baseFontPx);

  return {
    table: {
      widths: ["*", "*"],
      body: [
        [
          { text: "PAYMENT DETAILS", fontSize: config.tableHeaderPx, bold: true, ...fillProp },
          { text: "NOTES",           fontSize: config.tableHeaderPx, bold: true, ...fillProp },
        ],
        [
          { stack: paymentBody.length ? paymentBody : [{ text: "" }] },
          { stack: notesContent.length ? notesContent : [{ text: "" }] },
        ],
      ],
    },
    layout: footerLayout,
    margin: [hMargin, 0, hMargin, 0],
  };
}

// ── Footer height estimator ───────────────────────────────────────────────────
// Approximates the rendered height of the payment/notes table so we can
// reserve exactly the right amount of bottom-margin space for the footer callback.
// Runs in the browser (DOMParser available) before pdfmake is loaded.

function estimateFooterHeight(invoice: Invoice): number {
  const { config, payment, notesHtml } = invoice;
  const { baseFontPx, tableHeaderPx, marginLeft, marginRight } = config;

  const lineH = baseFontPx * 1.4;
  const headerH = tableHeaderPx * 1.8; // header row + small bottom gap

  // Each column is roughly half the A4 content width.
  // Roboto average character width ≈ 0.52 × font size.
  const contentWidth = 595 - marginLeft - marginRight;
  const colWidth = contentWidth / 2 - 8; // 8 pt cell-padding estimate
  const charsPerLine = Math.max(20, Math.floor(colWidth / (baseFontPx * 0.52)));

  // ── Payment column ────────────────────────────────────────────────────────
  const payLineCount =
    (payment.iban     ? Math.ceil((("IBAN: " + payment.iban).length) / charsPerLine)     : 0) +
    (payment.bicSwift ? Math.ceil((("BIC/SWIFT: " + payment.bicSwift).length) / charsPerLine) : 0) +
    (payment.extra    ? Math.ceil(payment.extra.length / charsPerLine) : 0);
  const payH = headerH + Math.max(1, payLineCount) * lineH;

  // ── Notes column ─────────────────────────────────────────────────────────
  let notesLineCount = 0;
  if (notesHtml?.trim()) {
    const doc = new DOMParser().parseFromString(notesHtml, "text/html");
    for (const node of Array.from(doc.body.childNodes)) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      if (tag === "p") {
        const len = (el.textContent ?? "").length;
        notesLineCount += Math.max(1, Math.ceil(len / charsPerLine)) + 0.3; // +0.3 for paragraph margin
      } else if (tag === "ul" || tag === "ol") {
        for (const li of Array.from(el.querySelectorAll("li"))) {
          const len = (li.textContent ?? "").length;
          notesLineCount += Math.max(1, Math.ceil(len / charsPerLine));
        }
      }
    }
  }
  const notesH = headerH + Math.max(1, notesLineCount) * lineH;

  // Take the taller column plus a 28 pt safety buffer.
  return Math.max(payH, notesH) + 28;
}

// ── Public composable ─────────────────────────────────────────────────────────

export function useInvoicePdf() {
  const generating = ref(false);

  async function generatePdf(invoice: Invoice) {
    generating.value = true;
    try {
      const [pdfMakeModule, pdfFontsModule] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);

      const pdfMake = pdfMakeModule.default;
      // pdfmake 0.3.x uses addVirtualFileSystem(); vfs_fonts exports the font map directly.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CJS interop, no types
      const fonts = pdfFontsModule as any;
      const vfs = fonts.default ?? fonts;
      pdfMake.addVirtualFileSystem(vfs);

      const { marginLeft, marginTop, marginRight, marginBottom } = invoice.config;
      // Reserve enough bottom space for the footer. estimateFooterHeight
      // measures the actual content so the footer callback never clips.
      const reservedBottom = Math.max(estimateFooterHeight(invoice), marginBottom);

      const docDef: DocDef = {
        content: [
          buildPreheader(invoice),
          buildPartiesTable(invoice),
          ...invoice.items.map((_, i) => buildItemsSection(invoice, i)),
        ],
        // footer callback → pdfmake pins this to the bottom of every page
        footer: () => buildFooterTable(invoice, marginLeft),
        defaultStyle: {
          fontSize: invoice.config.baseFontPx,
          font: "Roboto",
          lineHeight: 1.4,
        },
        pageSize: "A4",
        pageMargins: [marginLeft, marginTop, marginRight, reservedBottom],
      };

      const filename = invoice.preheader.invoiceNumber
        ? `invoice-${invoice.preheader.invoiceNumber}.pdf`
        : `invoice-${invoice.id.slice(0, 8)}.pdf`;

      pdfMake.createPdf(docDef).download(filename);
    } finally {
      generating.value = false;
    }
  }

  return { generatePdf, generating };
}
