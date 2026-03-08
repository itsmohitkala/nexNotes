import { useState, useEffect, useRef } from 'react';
import { BookOpen, Lightbulb, HelpCircle, BookMarked, X, Loader2, Sparkles } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

export interface StructuredNote {
  title?: string;
  oneLineSummary?: string;
  keyPoints?: string[];
  sections?: { heading: string; points: string[] }[];
  glossary?: { term: string; meaning: string }[];
  questions?: string[];
}

export interface NoteInsight {
  id: string;
  action: string;
  selectedText: string;
  answer: string;
}

interface Props {
  title: string;
  content: string;
  summary?: string | null;
  structured?: StructuredNote | null;
  insights: NoteInsight[];
  loadingInsight: boolean;
  onHighlightAction: (action: string, selectedText: string) => void;
  onRemoveInsight: (id: string) => void;
}

const INLINE_ACTIONS = ['Explain', 'Simplify', 'Summarise'];
const ALL_ACTIONS = [...INLINE_ACTIONS, 'Ask question'];

export const NotesReadyState = ({
  title, content, summary, structured,
  insights, loadingInsight, onHighlightAction, onRemoveInsight,
}: Props) => {
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

  const handleAction = (action: string) => {
    onHighlightAction(action, selectedText);
    setToolbarPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const hasStructured = structured && (
    structured.sections?.length ||
    structured.keyPoints?.length ||
    structured.glossary?.length ||
    structured.questions?.length
  );

  return (
    <div className="relative max-w-3xl mx-auto px-8 py-10" ref={containerRef}>
      {/* Title */}
      <div className="inline-block rounded-md bg-secondary px-4 py-2 mb-6">
        <h1 className="text-lg font-semibold text-foreground">{structured?.title || title}</h1>
      </div>

      {/* Main notes card */}
      <div className="rounded-xl border-2 border-accent/40 bg-card p-6 glow-border relative space-y-8">

        {/* Summary */}
        {(summary || structured?.oneLineSummary) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <BookOpen className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wider font-semibold">Summary</p>
            </div>
            <p className="text-sm text-secondary-foreground leading-relaxed">
              {summary || structured?.oneLineSummary}
            </p>
          </div>
        )}

        {/* Key Points */}
        {structured?.keyPoints && structured.keyPoints.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Lightbulb className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wider font-semibold">Key Points</p>
            </div>
            <ul className="space-y-2">
              {structured.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-secondary-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections */}
        {structured?.sections && structured.sections.length > 0 && (
          <div className="space-y-6">
            {structured.sections.map((section, i) => (
              <div key={i} className="space-y-3">
                <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
                  {section.heading}
                </h2>
                <ul className="space-y-2 pl-1">
                  {section.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-secondary-foreground leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Glossary */}
        {structured?.glossary && structured.glossary.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <BookMarked className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wider font-semibold">Glossary</p>
            </div>
            <div className="grid gap-2">
              {structured.glossary.map((item, i) => (
                <div key={i} className="rounded-lg bg-secondary/50 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{item.term}</span>
                  <span className="text-sm text-muted-foreground"> — {item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {structured?.questions && structured.questions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <HelpCircle className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wider font-semibold">Review Questions</p>
            </div>
            <ol className="space-y-2 list-decimal list-inside">
              {structured.questions.map((q, i) => (
                <li key={i} className="text-sm text-secondary-foreground leading-relaxed">
                  {q}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Fallback: plain content */}
        {!hasStructured && content && (
          <div className="text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        )}

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
            {ALL_ACTIONS.map((action) => (
              <button
                key={action}
                className="text-xs px-2 py-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleAction(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading insight indicator */}
      {loadingInsight && (
        <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          <span className="text-sm text-muted-foreground">Generating AI insight...</span>
        </div>
      )}

      {/* AI Insight blocks */}
      {insights.map((insight) => (
        <div key={insight.id} className="mt-4 rounded-lg border border-accent/30 bg-card p-4 space-y-2 relative group">
          <button
            onClick={() => onRemoveInsight(insight.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">{insight.action}</span>
          </div>
          <p className="text-xs text-muted-foreground italic border-l-2 border-accent/30 pl-3">
            "{insight.selectedText.length > 120 ? insight.selectedText.slice(0, 120) + '…' : insight.selectedText}"
          </p>
          <p className="text-sm text-secondary-foreground leading-relaxed">{insight.answer}</p>
        </div>
      ))}
    </div>
  );
};
