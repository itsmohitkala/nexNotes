import { NoteData } from '@/pages/Workspace';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, Loader2, AlertCircle, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { askAiQuestion } from '@/lib/n8n-api';
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

export const AiAssistant = ({ note, pendingQuestion, onPendingHandled }: Props) => {
  const [open, setOpen] = useState(false);
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
      content: selectedText ? `[Highlighted: "${selectedText.slice(0, 80)}${selectedText.length > 80 ? '…' : ''}"]\n${question}` : question,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionOverride) setInput('');
    setLoading(true);

    try {
      const payload = { userId: user.id, noteId: note.id, question, selectedText };
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

  useEffect(() => {
    if (!pendingQuestion || !note?.id || !user?.id) return;
    if (sendingRef.current) return;
    setOpen(true);
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
    <div className="border-t border-border bg-background shrink-0">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-6 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bot className="h-4 w-4 text-primary" />
        <span className="font-medium">AI Assistant</span>
        <span className="text-[13px] text-muted-foreground/60 ml-1">
          {messages.length > 0 ? `${messages.length} messages` : 'Ask about your notes'}
        </span>
        {open ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronUp className="h-4 w-4 ml-auto" />}
      </button>

      {open && (
        <div className="px-6 pb-5 space-y-3">
          {/* Messages */}
          <div className="max-h-[320px] overflow-auto space-y-3" ref={scrollRef}>
            {messages.length === 0 && !loading && (
              <div className="flex items-center gap-3 py-6 text-muted-foreground">
                <Bot className="h-5 w-5 text-muted-foreground/50" />
                <p className="text-sm">Ask anything about your notes. Highlight text for contextual questions.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="animate-fade-in">
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5">
                      <span className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</span>
                    </div>
                  </div>
                ) : msg.role === 'error' ? (
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span className="text-sm text-destructive/80">{msg.content}</span>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.content)}
                          className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 max-w-[900px]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask a question about this note..."
              disabled={loading || !note}
              className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 border border-border focus:border-primary/30 transition-colors"
            />
            <Button size="icon" className="h-9 w-9 shrink-0 rounded-xl bg-primary hover:bg-primary/90" onClick={() => handleSend()} disabled={loading || !note}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
