import { NoteData } from '@/pages/Workspace';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, Loader2, AlertCircle, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { askAiQuestion } from '@/lib/n8n-api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  note: NoteData | null;
  pendingQuestion?: { question: string; selectedText: string } | null;
  onPendingHandled?: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

/** Poll note_chats table for the answer by record id */
async function pollForAnswer(chatId: string, maxAttempts = 30, interval = 2000): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase
      .from('note_chats')
      .select('answer')
      .eq('id', chatId)
      .single();

    if (data?.answer && data.answer.trim().length > 0) {
      return data.answer;
    }
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('Timed out waiting for AI response.');
}

export const AiAssistant = ({ note, pendingQuestion, onPendingHandled }: Props) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    setMessages([]);
  }, [note?.id]);

  const handleSend = useCallback(async (questionOverride?: string, selectedTextOverride?: string | null) => {
    const question = (questionOverride || input).trim();
    if (!question) return;
    if (!note?.id) {
      setMessages((prev) => [...prev, { role: 'error', content: 'No note selected.' }]);
      return;
    }
    if (!user?.id) {
      setMessages((prev) => [...prev, { role: 'error', content: 'Not authenticated.' }]);
      return;
    }
    if (sendingRef.current) return;

    sendingRef.current = true;
    const selectedText = selectedTextOverride ?? null;

    const userMsg: Message = {
      role: 'user',
      content: selectedText ? `Highlighted: "${selectedText.slice(0, 100)}${selectedText.length > 100 ? '…' : ''}"\n\n${question}` : question,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionOverride) setInput('');
    setLoading(true);

    try {
      const payload = { userId: user.id, noteId: note.id, question, selectedText };
      console.log('[AiAssistant] Sending payload:', payload);
      const res = await askAiQuestion(payload);

      let answer: string;
      if (res.asyncId) {
        // Webhook returned an async id — poll note_chats for the real answer
        answer = await pollForAnswer(res.asyncId);
      } else {
        answer = res.answer || 'No response received.';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get a response.';
      setMessages((prev) => [...prev, { role: 'error', content: errorMsg }]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [input, note?.id, user?.id]);

  useEffect(() => {
    if (!pendingQuestion || !note?.id || !user?.id) return;
    if (sendingRef.current) return;
    const timer = setTimeout(() => {
      handleSend(pendingQuestion.question, pendingQuestion.selectedText);
      onPendingHandled?.();
    }, 50);
    return () => clearTimeout(timer);
  }, [pendingQuestion, note?.id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="w-[320px] border-l border-border bg-background flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-[15px] font-semibold text-foreground">AI Assistant</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Bot className="h-8 w-8 text-muted-foreground/20 mb-3" />
            <p className="text-[13px] text-muted-foreground">Ask anything about your notes.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-in">
            {msg.role === 'user' ? (
              <div className="bg-accent rounded-xl px-4 py-3">
                <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            ) : msg.role === 'error' ? (
              <div className="flex gap-2 items-start px-1">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-[13px] text-destructive/80">{msg.content}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[13px] text-secondary-foreground whitespace-pre-wrap leading-[1.7] px-1">{msg.content}</p>
                <div className="flex items-center gap-1 px-1">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 px-1 animate-fade-in">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2 bg-card rounded-xl border border-border px-3 py-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Ask a question..."
            disabled={loading || !note}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none py-1.5 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !note}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
