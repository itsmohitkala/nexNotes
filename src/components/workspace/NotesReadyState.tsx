import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Sparkles, Star, Layers, AlignLeft, HelpCircle } from 'lucide-react';

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
    <div className="relative w-full max-w-[900px] mx-auto px-8 md:px-12 py-10" ref={containerRef}>
      {/* Title */}
      <h1 className="text-[30px] font-bold text-foreground leading-tight tracking-tight mb-4">
        {structured?.title || title}
      </h1>

      {/* Summary */}
      {(summary || structured?.oneLineSummary) && (
        <p className="text-[15px] text-secondary-foreground leading-[1.8] mb-10">
          {summary || structured?.oneLineSummary}
        </p>
      )}

      {!summary && !structured?.oneLineSummary && <div className="mb-8" />}

      {/* Document sections */}
      <div className="space-y-10">

        {/* Key Points */}
        {structured?.keyPoints && structured.keyPoints.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-1 rounded-full bg-marker-purple" />
              <h2 className="text-[18px] font-semibold text-foreground">Key Points</h2>
            </div>
            <ul className="space-y-2.5 ml-4">
              {structured.keyPoints.map((point, i) => (
                <li key={i} className="text-[15px] text-secondary-foreground leading-[1.8] flex items-start gap-3">
                  <span className="mt-[11px] h-[5px] w-[5px] rounded-full bg-muted-foreground/40 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sections */}
        {structured?.sections && structured.sections.length > 0 && (
          structured.sections.map((section, i) => (
            <section key={i}>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-1 rounded-full bg-marker-green" />
                <h2 className="text-[18px] font-semibold text-foreground">{section.heading}</h2>
              </div>
              <ul className="space-y-2.5 ml-4">
                {section.points.map((point, j) => (
                  <li key={j} className="text-[15px] text-secondary-foreground leading-[1.8] flex items-start gap-3">
                    <span className="mt-[11px] h-[5px] w-[5px] rounded-full bg-muted-foreground/30 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        {/* Glossary */}
        {structured?.glossary && structured.glossary.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-1 rounded-full bg-marker-blue" />
              <h2 className="text-[18px] font-semibold text-foreground">Glossary</h2>
            </div>
            <dl className="space-y-2.5 ml-4">
              {structured.glossary.map((item, i) => (
                <div key={i}>
                  <dt className="text-[15px] font-semibold text-foreground inline">{item.term}</dt>
                  <dd className="text-[15px] text-secondary-foreground inline"> — {item.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Questions */}
        {structured?.questions && structured.questions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-1 rounded-full bg-marker-orange" />
              <h2 className="text-[18px] font-semibold text-foreground">Review Questions</h2>
            </div>
            <ol className="space-y-2.5 ml-4">
              {structured.questions.map((q, i) => (
                <li key={i} className="text-[15px] text-secondary-foreground leading-[1.8] flex items-start gap-3">
                  <span className="text-muted-foreground font-medium shrink-0 w-5 text-right">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Fallback */}
        {!hasStructured && content && (
          <section>
            <div className="text-[15px] text-secondary-foreground whitespace-pre-wrap leading-[1.8]">
              {content}
            </div>
          </section>
        )}
      </div>

      {/* Floating toolbar */}
      {toolbarPos && (
        <div
          className="absolute z-50 flex items-center gap-0.5 rounded-xl bg-card border border-border px-1.5 py-1 shadow-xl animate-fade-in"
          style={{
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {ALL_ACTIONS.map((action) => {
            const icons: Record<string, React.ElementType> = {
              'Explain': Star,
              'Simplify': Layers,
              'Summarise': AlignLeft,
              'Ask question': HelpCircle,
            };
            const Icon = icons[action] || Star;
            return (
              <button
                key={action}
                className="text-[13px] px-3 py-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
                onClick={() => handleAction(action)}
              >
                <Icon className="h-3.5 w-3.5" />
                {action === 'Ask question' ? 'Ask AI' : action}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading insight */}
      {loadingInsight && (
        <div className="mt-8 flex items-center gap-3 py-3 animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Generating AI insight...</span>
        </div>
      )}

      {/* Insights */}
      {insights.map((insight) => (
        <div key={insight.id} className="mt-6 relative group animate-fade-in">
          <div className="rounded-xl border border-border bg-card p-5">
            <button
              onClick={() => onRemoveInsight(insight.id)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-accent"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">{insight.action}</span>
            </div>
            {insight.selectedText && (
              <p className="text-[13px] text-muted-foreground italic border-l-2 border-muted-foreground/30 pl-3 mb-3">
                "{insight.selectedText.length > 120 ? insight.selectedText.slice(0, 120) + '…' : insight.selectedText}"
              </p>
            )}
            <p className="text-[15px] text-secondary-foreground leading-[1.8]">{insight.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
