import { NoteData } from '@/pages/Workspace';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, Send, Bot, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { askAiQuestion } from '@/lib/n8n-api';

interface Props {
  note: NoteData | null;
  pendingQuestion?: { question: string; selectedText: string } | null;
  onPendingHandled?: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export const AiAssistant = ({ note, pendingQuestion, onPendingHandled }: Props) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false); // prevent duplicate sends
  const { user } = useAuth();

  // Reset messages when note changes
  useEffect(() => {
    setMessages([]);
  }, [note?.id]);

  const handleSend = useCallback(async (questionOverride?: string, selectedTextOverride?: string | null) => {
    const question = (questionOverride || input).trim();

    // Validation
    if (!question) {
      console.warn('[AiAssistant] Empty question, skipping send');
      return;
    }
    if (!note?.id) {
      setMessages((prev) => [...prev, { role: 'error', content: 'No note selected. Please select a note first.' }]);
      return;
    }
    if (!user?.id) {
      setMessages((prev) => [...prev, { role: 'error', content: 'Not authenticated. Please log in again.' }]);
      return;
    }
    if (sendingRef.current) {
      console.warn('[AiAssistant] Already sending, skipping duplicate');
      return;
    }

    sendingRef.current = true;
    const selectedText = selectedTextOverride ?? null;

    const userMsg: Message = {
      role: 'user',
      content: selectedText ? `[Highlighted: "${selectedText.slice(0, 80)}${selectedText.length > 80 ? '…' : ''}"]\n${question}` : question,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionOverride) setInput('');
    setLoading(true);

    try {
      const payload = {
        userId: user.id,
        noteId: note.id,
        question,
        selectedText,
      };

      console.log('[AiAssistant] Sending payload:', payload);

      const res = await askAiQuestion(payload);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get a response.';
      setMessages((prev) => [...prev, { role: 'error', content: errorMsg }]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [input, note?.id, user?.id]);

  // Handle pending "Ask Question" from highlight toolbar
  useEffect(() => {
    if (!pendingQuestion || !note?.id || !user?.id) return;
    if (sendingRef.current) return;

    setOpen(true);
    // Use a microtask to ensure state is settled
    const timer = setTimeout(() => {
      handleSend(pendingQuestion.question, pendingQuestion.selectedText);
      onPendingHandled?.();
    }, 50);

    return () => clearTimeout(timer);
  }, [pendingQuestion, note?.id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="border-t border-border bg-card shrink-0">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bot className="h-4 w-4 text-accent" />
        <span className="font-medium">AI Assistant</span>
        {open ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronUp className="h-4 w-4 ml-auto" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Messages */}
          <div className="max-h-48 overflow-auto space-y-2" ref={scrollRef}>
            {messages.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground">Ask anything about your notes...</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-secondary text-foreground ml-8'
                    : msg.role === 'error'
                    ? 'bg-destructive/10 text-destructive mr-8'
                    : 'bg-muted text-secondary-foreground mr-8'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="text-xs text-accent font-medium block mb-1">AI</span>
                )}
                {msg.role === 'error' && (
                  <span className="flex items-center gap-1 text-xs font-medium mb-1">
                    <AlertCircle className="h-3 w-3" /> Error
                  </span>
                )}
                <span className="whitespace-pre-wrap">{msg.content}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mr-8 bg-muted rounded-lg px-3 py-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask a question..."
              disabled={loading || !note}
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => handleSend()} disabled={loading || !note}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
