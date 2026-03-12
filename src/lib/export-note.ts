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
  const md = structuredNoteToMarkdown(title, summary, structured, content);
  const displayTitle = prettifyTitle(structured?.title || title);
  const safeTitle = displayTitle.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-');

  // Build a simple HTML document and use browser print-to-PDF
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${displayTitle}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.7; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  h2 { font-size: 18px; margin-top: 28px; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
  ul, ol { padding-left: 24px; }
  li { margin-bottom: 4px; }
  p { margin: 8px 0; }
</style></head><body>${markdownToHtml(md)}</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/** Minimal markdown-to-HTML for PDF export */
function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^- \*\*(.+?)\*\*\s*—\s*(.+)$/gm, '<li><strong>$1</strong> — $2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      const isOrdered = /^\d+\./.test(md.slice(md.indexOf(match.trim().slice(4, 20)) - 5, md.indexOf(match.trim().slice(4, 20))));
      return isOrdered ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
    })
    .replace(/\n{2,}/g, '\n')
    .replace(/^(?!<[hulo])(.*\S.*)$/gm, '<p>$1</p>');
}
