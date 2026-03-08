import { useState, useEffect, useRef } from 'react';

interface Props {
  title: string;
  content: string;
}

const AI_ACTIONS = ['Explain', 'Simplify', 'Summarise', 'Ask question'];

export const NotesReadyState = ({ title, content }: Props) => {
  const [selectedText, setSelectedText] = useState('');
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0 && containerRef.current?.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current!.getBoundingClientRect();
        setSelectedText(sel.toString());
        setToolbarPos({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 10,
        });
      } else {
        setToolbarPos(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto px-8 py-10" ref={containerRef}>
      {/* Heading */}
      <div className="inline-block rounded-md bg-secondary px-4 py-2 mb-6">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Notes panel */}
      <div className="rounded-xl border-2 border-accent/40 bg-card p-6 glow-border relative">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Notes panel</p>
        <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
        <div className="text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed prose-content">
          {content}
        </div>

        {/* Floating toolbar */}
        {toolbarPos && (
          <div
            className="absolute z-50 flex items-center gap-1 rounded-lg bg-muted border border-border px-2 py-1 shadow-xl"
            style={{
              left: toolbarPos.x,
              top: toolbarPos.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {AI_ACTIONS.map((action) => (
              <button
                key={action}
                className="text-xs px-2 py-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  console.log(`AI action: ${action} on "${selectedText}"`);
                  setToolbarPos(null);
                }}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
