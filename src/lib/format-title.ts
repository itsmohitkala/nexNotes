/**
 * Prettify raw note titles:
 * - Replace underscores and hyphens with spaces
 * - Title-case each word
 * - Trim extra whitespace
 */
export function prettifyTitle(raw: string): string {
  if (!raw) return 'Untitled';
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
