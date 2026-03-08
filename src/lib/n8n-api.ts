// Centralized n8n webhook endpoints
export const N8N_AI_QUESTION_WEBHOOK =
  'https://n8n.srv1006534.hstgr.cloud/webhook-test/609d69a1-9c8d-4755-81a4-d50026fd5c85';

export const N8N_HIGHLIGHT_WEBHOOK =
  'https://n8n.srv1006534.hstgr.cloud/webhook-test/5272f3ff-969b-46ab-827e-3929e56649ef';

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

export async function askAiQuestion(payload: AiQuestionPayload): Promise<AiResponse> {
  const res = await fetch(N8N_AI_QUESTION_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`AI question failed: ${res.status}`);
  return res.json();
}

export async function performHighlightAction(payload: HighlightActionPayload): Promise<AiResponse> {
  const res = await fetch(N8N_HIGHLIGHT_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Highlight action failed: ${res.status}`);
  return res.json();
}
