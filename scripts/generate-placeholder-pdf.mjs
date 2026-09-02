#!/usr/bin/env node
/**
 * Generates the stand-in PDF the lead magnet serves until the real guide is in
 * R2.
 *
 * ## Why generate one instead of committing a file
 *
 * The opt-in has to work end to end *now* — a download button that 404s is
 * worse than no download button, and "it will work once the bucket has the
 * file" is not something a visitor can see. So the funnel needs a real PDF
 * today, and the same rule applies to it as to every other asset here: it is
 * drawn by a script in this repo, not fetched from anywhere
 * (docs/adr/0003-no-third-party-imagery-shipped.md).
 *
 * ## Why it is written by hand rather than with a PDF library
 *
 * A one-page PDF is a few hundred bytes of plain text: a header, four objects,
 * a cross-reference table of byte offsets, a trailer. A library to emit that
 * would be a dependency on the critical path of a conversion page, for one file
 * that says "this is a placeholder". The offsets are the only fiddly part and
 * they are computed below rather than hard-coded.
 *
 * It is deliberately honest about what it is: someone who fills in the form
 * today gets a page telling them the real thing is coming, not nine blank
 * sheets pretending to be a guide.
 *
 *   npm run gen:placeholder-pdf
 *
 * Output: public/assets/playbook-placeholder.pdf
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/assets/playbook-placeholder.pdf");

/** Points, US Letter. */
const W = 612;
const H = 792;

const LINES = [
  { text: "What to automate first", size: 28, leading: 42 },
  { text: "", size: 11, leading: 20 },
  { text: "This is a placeholder.", size: 13, leading: 24 },
  { text: "", size: 11, leading: 10 },
  { text: "The worksheet itself is being finished. The address you gave", size: 11, leading: 17 },
  { text: "us is on the list, and the real thing will reach you as soon", size: 11, leading: 17 },
  { text: "as it exists.", size: 11, leading: 17 },
  { text: "", size: 11, leading: 20 },
  { text: "In the meantime, the short version:", size: 11, leading: 20 },
  { text: "", size: 11, leading: 6 },
  { text: "1.  Time the task, do not estimate it. The one that feels", size: 11, leading: 17 },
  { text: "    expensive and the one that is expensive are rarely the", size: 11, leading: 17 },
  { text: "    same task.", size: 11, leading: 17 },
  { text: "", size: 11, leading: 10 },
  { text: "2.  Count the handoffs. Work that crosses three people costs", size: 11, leading: 17 },
  { text: "    more in waiting than in doing.", size: 11, leading: 17 },
  { text: "", size: 11, leading: 10 },
  { text: "3.  Ask what happens when it goes wrong. If nobody knows,", size: 11, leading: 17 },
  { text: "    that is the thing to fix before automating any of it.", size: 11, leading: 17 },
  { text: "", size: 11, leading: 10 },
  { text: "4.  Automate the boring middle, never the judgement at", size: 11, leading: 17 },
  { text: "    either end.", size: 11, leading: 17 },
  { text: "", size: 11, leading: 26 },
  { text: "Godwin Austen Labs  --  hello@godwinausten.org", size: 10, leading: 16 },
];

/** Escape the three characters that are syntax inside a PDF string literal. */
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

let y = H - 96;
const runs = [];
for (const line of LINES) {
  if (line.text) {
    runs.push(`BT /F1 ${line.size} Tf 72 ${y} Td (${esc(line.text)}) Tj ET`);
  }
  y -= line.leading;
}
const content = runs.join("\n");

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] ` +
    "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((body, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});

const xref = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets) {
  pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` + `startxref\n${xref}\n%%EOF\n`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, pdf, "latin1");
console.log(`playbook-placeholder.pdf — ${(pdf.length / 1024).toFixed(1)} KB`);
