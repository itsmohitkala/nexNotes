import { NoteData } from '@/pages/Workspace';
import { useState } from 'react';
import { ChevronUp, ChevronDown, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  note: NoteData | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiAssistant = ({ note }: Props) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);

    // Placeholder AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Based on your notes, here's what I found about "${input}"...` },
      ]);
    }, 800);

    setInput('');
  };

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
          <div className="max-h-48 overflow-auto space-y-2">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground">Ask anything about your notes...</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-secondary text-foreground ml-8'
                    : 'bg-muted text-secondary-foreground mr-8'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="text-xs text-accent font-medium block mb-1">AI</span>
                )}
                {msg.content}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
