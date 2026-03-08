import { useState, useEffect, useRef } from 'react';
import { BookOpen, Lightbulb, HelpCircle, BookMarked, X, Loader2, Sparkles, Layers } from 'lucide-react';
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
    <div className="relative max-w-4xl mx-auto px-8 py-8" ref={containerRef}>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-page-title text-foreground">{structured?.title || title}</h1>
        {(summary || structured?.oneLineSummary) && (
          <p className="mt-2 text-body text-muted-foreground leading-relaxed">
            {summary || structured?.oneLineSummary}
          </p>
        )}
      </div>

      {/* Knowledge Cards */}
      <div className="space-y-4">

        {/* Key Points Card */}
        {structured?.keyPoints && structured.keyPoints.length > 0 && (
          <div className="card-elevated p-6 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-section-title text-foreground">Key Points</h2>
            </div>
            <ul className="space-y-3">
              {structured.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-body text-secondary-foreground leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections Cards */}
        {structured?.sections && structured.sections.length > 0 && (
          structured.sections.map((section, i) => (
            <div key={i} className="card-elevated p-6 animate-fade-in">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-section-title text-foreground">{section.heading}</h2>
              </div>
              <ul className="space-y-2.5">
                {section.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-3 text-body text-secondary-foreground leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        {/* Glossary Card */}
        {structured?.glossary && structured.glossary.length > 0 && (
          <div className="card-elevated p-6 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookMarked className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-section-title text-foreground">Glossary</h2>
            </div>
            <div className="grid gap-2">
              {structured.glossary.map((item, i) => (
                <div key={i} className="rounded-md bg-muted/50 px-4 py-3 border border-border/50">
                  <span className="text-sm font-semibold text-foreground">{item.term}</span>
                  <span className="text-body text-muted-foreground"> — {item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Card */}
        {structured?.questions && structured.questions.length > 0 && (
          <div className="card-elevated p-6 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-section-title text-foreground">Review Questions</h2>
            </div>
            <ol className="space-y-3">
              {structured.questions.map((q, i) => (
                <li key={i} className="flex items-start gap-3 text-body text-secondary-foreground leading-relaxed">
                  <span className="text-caption text-primary font-semibold mt-0.5 shrink-0 w-5">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Fallback: plain content */}
        {!hasStructured && content && (
          <div className="card-elevated p-6 animate-fade-in">
            <div className="text-body text-secondary-foreground whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          </div>
        )}
      </div>

      {/* Floating toolbar */}
      {toolbarPos && (
        <div
          className="absolute z-50 flex items-center gap-0.5 rounded-lg bg-card border border-border px-1.5 py-1 shadow-xl animate-fade-in"
          style={{
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {ALL_ACTIONS.map((action) => (
            <button
              key={action}
              className="text-caption px-2.5 py-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors font-medium"
              onClick={() => handleAction(action)}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Loading insight indicator */}
      {loadingInsight && (
        <div className="mt-4 card-elevated p-4 flex items-center gap-3 border-primary/20 animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Generating AI insight...</span>
        </div>
      )}

      {/* AI Insight blocks */}
      {insights.map((insight) => (
        <div key={insight.id} className="mt-4 card-elevated p-5 space-y-3 relative group animate-fade-in">
          <button
            onClick={() => onRemoveInsight(insight.id)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-caption font-semibold uppercase tracking-wider text-primary">{insight.action}</span>
          </div>
          <p className="text-caption text-muted-foreground italic border-l-2 border-primary/30 pl-3">
            "{insight.selectedText.length > 120 ? insight.selectedText.slice(0, 120) + '…' : insight.selectedText}"
          </p>
          <p className="text-body text-secondary-foreground leading-relaxed">{insight.answer}</p>
        </div>
      ))}
    </div>
  );
};
