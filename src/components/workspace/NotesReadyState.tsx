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

const SectionMarker = ({ color, icon: Icon }: { color: string; icon: React.ElementType }) => (
  <div className={`flex items-center gap-2 mb-3`}>
    <div className={`h-1 w-6 rounded-full ${color}`} />
    <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-').replace('/60', '')}`} />
  </div>
);

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
    <div className="relative w-full max-w-[900px] mx-auto px-6 md:px-10 py-10" ref={containerRef}>
      {/* Title */}
      <h1 className="text-[32px] font-bold text-foreground leading-tight tracking-tight mb-2">
        {structured?.title || title}
      </h1>

      {/* Summary - inline, no card */}
      {(summary || structured?.oneLineSummary) && (
        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          {summary || structured?.oneLineSummary}
        </p>
      )}

      {!summary && !structured?.oneLineSummary && <div className="mb-10" />}

      {/* Document-style sections */}
      <div className="space-y-12">

        {/* Key Points */}
        {structured?.keyPoints && structured.keyPoints.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-marker-purple" />
              <h2 className="text-[18px] font-semibold text-foreground">Key Points</h2>
            </div>
            <ul className="space-y-3 pl-4">
              {structured.keyPoints.map((point, i) => (
                <li key={i} className="text-base text-secondary-foreground leading-[1.75] flex items-start gap-3">
                  <span className="mt-[10px] h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sections */}
        {structured?.sections && structured.sections.length > 0 && (
          structured.sections.map((section, i) => (
            <section key={i}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <h2 className="text-[18px] font-semibold text-foreground">{section.heading}</h2>
              </div>
              <ul className="space-y-3 pl-4">
                {section.points.map((point, j) => (
                  <li key={j} className="text-base text-secondary-foreground leading-[1.75] flex items-start gap-3">
                    <span className="mt-[10px] h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        {/* Glossary */}
        {structured?.glossary && structured.glossary.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h2 className="text-[18px] font-semibold text-foreground">Glossary</h2>
            </div>
            <dl className="space-y-3 pl-4">
              {structured.glossary.map((item, i) => (
                <div key={i}>
                  <dt className="text-base font-semibold text-foreground inline">{item.term}</dt>
                  <dd className="text-base text-muted-foreground inline"> — {item.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Questions */}
        {structured?.questions && structured.questions.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <h2 className="text-[18px] font-semibold text-foreground">Review Questions</h2>
            </div>
            <ol className="space-y-3 pl-4">
              {structured.questions.map((q, i) => (
                <li key={i} className="text-base text-secondary-foreground leading-[1.75] flex items-start gap-3">
                  <span className="text-muted-foreground font-medium shrink-0 w-5 text-right">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Fallback: plain content */}
        {!hasStructured && content && (
          <section>
            <div className="text-base text-secondary-foreground whitespace-pre-wrap leading-[1.75]">
              {content}
            </div>
          </section>
        )}
      </div>

      {/* Floating toolbar */}
      {toolbarPos && (
        <div
          className="absolute z-50 flex items-center gap-0.5 rounded-xl bg-background/95 backdrop-blur-sm border border-border px-1 py-0.5 shadow-lg animate-fade-in"
          style={{
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {ALL_ACTIONS.map((action) => (
            <button
              key={action}
              className="text-[13px] px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
              onClick={() => handleAction(action)}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Loading insight indicator */}
      {loadingInsight && (
        <div className="mt-8 flex items-center gap-3 py-3 animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Generating AI insight...</span>
        </div>
      )}

      {/* AI Insight blocks - minimal style */}
      {insights.map((insight) => (
        <div key={insight.id} className="mt-6 relative group animate-fade-in">
          <button
            onClick={() => onRemoveInsight(insight.id)}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[13px] font-semibold uppercase tracking-wider text-primary">{insight.action}</span>
          </div>
          <p className="text-[13px] text-muted-foreground italic border-l-2 border-muted pl-3 mb-2">
            "{insight.selectedText.length > 120 ? insight.selectedText.slice(0, 120) + '…' : insight.selectedText}"
          </p>
          <p className="text-base text-secondary-foreground leading-[1.75]">{insight.answer}</p>
        </div>
      ))}
    </div>
  );
};
