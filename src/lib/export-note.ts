import jsPDF from 'jspdf';
import type { StructuredNote } from '@/components/workspace/NotesReadyState';
import { prettifyTitle } from '@/lib/format-title';

export function structuredNoteToMarkdown(
  title: string,
  summary: string | null | undefined,
  structured: StructuredNote | null | undefined,
  content: string
): string {
  const lines: string[] = [];
  const displayTitle = prettifyTitle(structured?.title || title);
  lines.push(`# ${displayTitle}`, '');

  const summaryText = summary || structured?.oneLineSummary;
  if (summaryText) {
    lines.push(summaryText, '');
  }

  if (structured?.keyPoints?.length) {
    lines.push('## Key Points', '');
    structured.keyPoints.forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  }

  if (structured?.sections?.length) {
    structured.sections.forEach((s) => {
      lines.push(`## ${s.heading}`, '');
      s.points.forEach((p) => lines.push(`- ${p}`));
      lines.push('');
    });
  }

  if (structured?.glossary?.length) {
    lines.push('## Glossary', '');
    structured.glossary.forEach((g) => lines.push(`- **${g.term}** — ${g.meaning}`));
    lines.push('');
  }

  if (structured?.questions?.length) {
    lines.push('## Review Questions', '');
    structured.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    lines.push('');
  }

  // Fallback if no structured content
  if (
    !structured?.keyPoints?.length &&
    !structured?.sections?.length &&
    !structured?.glossary?.length &&
    !structured?.questions?.length &&
    content
  ) {
    lines.push(content, '');
  }

  return lines.join('\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(
  title: string,
  summary: string | null | undefined,
  structured: StructuredNote | null | undefined,
  content: string
) {
  const md = structuredNoteToMarkdown(title, summary, structured, content);
  const safeTitle = prettifyTitle(structured?.title || title).replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-');
  downloadBlob(new Blob([md], { type: 'text/markdown' }), `${safeTitle}.md`);
}

export function downloadPdf(
  title: string,
  summary: string | null | undefined,
  structured: StructuredNote | null | undefined,
  content: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const displayTitle = prettifyTitle(structured?.title || title);
  const safeTitle = displayTitle
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

  const margin = 20;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - margin * 2;
  let y = margin;

  // Advance y, adding a new page if needed
  const checkPage = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLine = (
    text: string,
    size: number,
    style: 'normal' | 'bold' = 'normal',
    rgb: [number, number, number] = [20, 20, 20]
  ) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    const lineH = size * 0.45; // mm per line at this font size
    const lines = doc.splitTextToSize(text, contentW) as string[];
    checkPage(lines.length * lineH);
    doc.text(lines, margin, y);
    y += lines.length * lineH;
  };

  const gap = (mm: number) => { checkPage(mm); y += mm; };

  // ── Title ──────────────────────────────────────────────────────────────
  writeLine(displayTitle, 20, 'bold', [10, 10, 10]);
  gap(5);

  // ── Summary ────────────────────────────────────────────────────────────
  const summaryText = summary || structured?.oneLineSummary;
  if (summaryText) {
    writeLine(summaryText, 11, 'normal', [70, 70, 90]);
    gap(7);
  }

  // ── Key Points ─────────────────────────────────────────────────────────
  if (structured?.keyPoints?.length) {
    writeLine('Key Points', 13, 'bold', [60, 60, 140]);
    gap(2);
    structured.keyPoints.forEach(point => {
      writeLine(`• ${point}`, 10, 'normal', [40, 40, 40]);
      gap(1);
    });
    gap(5);
  }

  // ── Sections ───────────────────────────────────────────────────────────
  if (structured?.sections?.length) {
    structured.sections.forEach(section => {
      writeLine(section.heading, 13, 'bold', [50, 120, 80]);
      gap(2);
      section.points.forEach(point => {
        writeLine(`• ${point}`, 10, 'normal', [40, 40, 40]);
        gap(1);
      });
      gap(5);
    });
  }

  // ── Glossary ───────────────────────────────────────────────────────────
  if (structured?.glossary?.length) {
    writeLine('Glossary', 13, 'bold', [50, 90, 160]);
    gap(2);
    structured.glossary.forEach(item => {
      writeLine(`${item.term} — ${item.meaning}`, 10, 'normal', [40, 40, 40]);
      gap(1);
    });
    gap(5);
  }

  // ── Review Questions ───────────────────────────────────────────────────
  if (structured?.questions?.length) {
    writeLine('Review Questions', 13, 'bold', [160, 100, 40]);
    gap(2);
    structured.questions.forEach((q, i) => {
      writeLine(`${i + 1}. ${q}`, 10, 'normal', [40, 40, 40]);
      gap(1.5);
    });
  }

  // ── Fallback raw content ───────────────────────────────────────────────
  if (
    !structured?.keyPoints?.length &&
    !structured?.sections?.length &&
    !structured?.glossary?.length &&
    !structured?.questions?.length &&
    content
  ) {
    writeLine(content, 10, 'normal', [40, 40, 40]);
  }

  // Trigger immediate browser download — no dialog
  doc.save(`${safeTitle}.pdf`);
}
