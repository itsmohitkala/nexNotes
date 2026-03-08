import { NoteData } from '@/pages/Workspace';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, Loader2, AlertCircle, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { askAiQuestion } from '@/lib/n8n-api';
import { toast } from 'sonner';

interface Props {
  note: NoteData | null;
  pendingQuestion?: { question: string; selectedText: string } | null;
  onPendingHandled?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export const AiAssistant = ({ note, pendingQuestion, onPendingHandled, isOpen, onToggle }: Props) => {
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
      setMessages((prev) => [...prev, { role: 'error', content: 'No note selected. Please select a note first.' }]);
      return;
    }
    if (!user?.id) {
      setMessages((prev) => [...prev, { role: 'error', content: 'Not authenticated. Please log in again.' }]);
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

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-card border border-border border-r-0 rounded-l-lg px-1.5 py-3 hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="w-[340px] border-l border-border bg-card flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">AI Assistant</span>
        </div>
        <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-muted transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3" ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <Bot className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-caption text-muted-foreground max-w-[200px]">
              Ask anything about your notes. Highlight text to ask contextual questions.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`animate-fade-in ${msg.role === 'user' ? 'ml-8' : 'mr-4'}`}>
            {msg.role === 'user' ? (
              <div className="rounded-lg bg-primary/10 border border-primary/20 px-3.5 py-2.5">
                <span className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</span>
              </div>
            ) : msg.role === 'error' ? (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-caption font-medium text-destructive mb-1">
                  <AlertCircle className="h-3 w-3" /> Error
                </span>
                <span className="text-sm text-destructive/80 whitespace-pre-wrap">{msg.content}</span>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/50 border border-border px-3.5 py-2.5 space-y-2">
                <span className="text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</span>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-caption text-muted-foreground mr-4 bg-muted/50 border border-border rounded-lg px-3.5 py-2.5 animate-fade-in">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Ask a question..."
            disabled={loading || !note}
            className="flex-1 bg-muted rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 border border-border focus:border-primary/40 transition-colors"
          />
          <Button size="icon" className="h-9 w-9 shrink-0 bg-primary hover:bg-primary/90" onClick={() => handleSend()} disabled={loading || !note}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
