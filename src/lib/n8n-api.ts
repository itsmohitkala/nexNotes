// Centralized n8n webhook endpoints
export const N8N_AI_QUESTION_WEBHOOK =
  'https://n8n.srv1006534.hstgr.cloud/webhook/609d69a1-9c8d-4755-81a4-d50026fd5c85';

export const N8N_HIGHLIGHT_WEBHOOK =
  'https://n8n.srv1006534.hstgr.cloud/webhook/5272f3ff-969b-46ab-827e-3929e56649ef';

export const N8N_PROCESS_WEBHOOK =
  'https://n8n.srv1006534.hstgr.cloud/webhook/f29d58c6-3923-4ddb-9426-85667b7d8266';

export interface AiQuestionPayload {
  userId: string;
  noteId: string;
  question: string;
  selectedText: string | null;
}

export interface HighlightActionPayload {
  userId: string;
  noteId: string;
  selectedText: string;
  action: 'explain' | 'simplify' | 'summarise';
}

export interface AiResponse {
  answer: string;
}

/**
 * Normalize n8n response which may be:
 * - { answer: "..." }
 * - plain text string
 * - nested JSON: { data: { answer: "..." } }
 * - array: [{ answer: "..." }]
 */
function normalizeAiResponse(raw: unknown): AiResponse {
  if (typeof raw === 'string') {
    return { answer: raw };
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return normalizeAiResponse(raw[0]);
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.answer === 'string') return { answer: obj.answer };
    if (typeof obj.output === 'string') return { answer: obj.output };
    if (typeof obj.text === 'string') return { answer: obj.text };
    if (typeof obj.response === 'string') return { answer: obj.response };
    if (obj.data) return normalizeAiResponse(obj.data);
    // Last resort: stringify
    return { answer: JSON.stringify(raw) };
  }
  return { answer: String(raw) };
}

export interface AiQuestionResult {
  /** If the webhook returned an async id, poll note_chats for the answer */
  asyncId?: string;
  answer?: string;
}

export async function askAiQuestion(payload: AiQuestionPayload): Promise<AiQuestionResult> {
  console.log('[n8n] askAiQuestion →', N8N_AI_QUESTION_WEBHOOK);
  console.log('[n8n] payload:', JSON.stringify(payload, null, 2));

  const res = await fetch(N8N_AI_QUESTION_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    console.error('[n8n] AI question failed:', res.status, errorText);
    throw new Error(`AI question failed (${res.status}): ${errorText || 'Unknown error'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  let raw: unknown;
  if (contentType.includes('application/json')) {
    raw = await res.json();
  } else {
    raw = await res.text();
  }

  console.log('[n8n] raw response:', raw);

  // Check if it's an async response with an id
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj.success && typeof obj.id === 'string') {
      return { asyncId: obj.id };
    }
  }

  const normalized = normalizeAiResponse(raw);
  return { answer: normalized.answer };
}

export async function performHighlightAction(payload: HighlightActionPayload): Promise<AiResponse> {
  console.log('[n8n] performHighlightAction →', N8N_HIGHLIGHT_WEBHOOK);
  console.log('[n8n] payload:', JSON.stringify(payload, null, 2));

  const res = await fetch(N8N_HIGHLIGHT_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    console.error('[n8n] Highlight action failed:', res.status, errorText);
    throw new Error(`Highlight action failed (${res.status}): ${errorText || 'Unknown error'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  let raw: unknown;
  if (contentType.includes('application/json')) {
    raw = await res.json();
  } else {
    raw = await res.text();
  }

  console.log('[n8n] raw response:', raw);
  return normalizeAiResponse(raw);
}
