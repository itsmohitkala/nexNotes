import React, { useState, useEffect, useRef, useCallback } from 'react';
import { prettifyTitle } from '@/lib/format-title';
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
  sectionIndex?: number; // set at creation time
}

interface Props {
  title: string;
  content: string;
  summary?: string | null;
  structured?: StructuredNote | null;
  insights: NoteInsight[];
  loadingInsight: boolean;
  onHighlightAction: (action: string, selectedText: string, sectionIndex?: number) => void;
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
  const [insightSectionMap, setInsightSectionMap] = useState<Record<string, number>>({});
  const [pendingSectionIndex, setPendingSectionIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const latestInsightRef = useRef<HTMLDivElement>(null);

  // Find which section index a DOM node belongs to
  const findSectionIndex = useCallback((node: Node | null): number => {
    if (!containerRef.current || !node) return -1;
    const sections = sectionRefs.current;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i]?.contains(node)) return i;
    }
    return sections.length - 1; // fallback to last section
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0 && containerRef.current?.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const sectionIdx = findSectionIndex(sel.anchorNode);

        setSelectedText(sel.toString());
        setPendingSectionIndex(sectionIdx);
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
  }, [findSectionIndex]);

  // Map new insights to their section at the time they arrive
  useEffect(() => {
    if (insights.length > 0) {
      const latest = insights[insights.length - 1];
      // If the insight already has a sectionIndex from parent, use it
      if (latest.sectionIndex !== undefined && insightSectionMap[latest.id] === undefined) {
        setInsightSectionMap(prev => ({ ...prev, [latest.id]: latest.sectionIndex! }));
      } else if (insightSectionMap[latest.id] === undefined && pendingSectionIndex !== null) {
        setInsightSectionMap(prev => ({ ...prev, [latest.id]: pendingSectionIndex }));
        setPendingSectionIndex(null);
      }
    }
  }, [insights, insightSectionMap, pendingSectionIndex]);

  // Auto-scroll to newly added insight
  useEffect(() => {
    if (insights.length > 0 && latestInsightRef.current) {
      latestInsightRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [insights.length]);

  const handleAction = (action: string) => {
    // Capture the section index NOW, before the async call
    const capturedSection = pendingSectionIndex;
    onHighlightAction(action, selectedText, capturedSection ?? undefined);
    setToolbarPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const hasStructured = structured && (
    structured.sections?.length ||
    structured.keyPoints?.length ||
    structured.glossary?.length ||
    structured.questions?.length
  );

  // Collect all content sections into an ordered list for rendering
  const contentSections: { key: string; element: React.ReactNode }[] = [];
  let sectionCounter = 0;

  // Key Points
  if (structured?.keyPoints && structured.keyPoints.length > 0) {
    const idx = sectionCounter++;
    contentSections.push({
      key: `keypoints-${idx}`,
      element: (
        <section ref={el => { sectionRefs.current[idx] = el; }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-1 rounded-full bg-marker-purple" />
            <h2 className="text-[18px] font-semibold text-foreground">Key Points</h2>
          </div>
          <ul className="space-y-2.5 ml-4">
            {structured.keyPoints!.map((point, i) => (
              <li key={i} className="text-[15px] text-secondary-foreground leading-[1.8] flex items-start gap-3">
                <span className="mt-[11px] h-[5px] w-[5px] rounded-full bg-muted-foreground/40 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      ),
    });
  }

  // Sections
  if (structured?.sections && structured.sections.length > 0) {
    structured.sections.forEach((section, i) => {
      const idx = sectionCounter++;
      contentSections.push({
        key: `section-${idx}`,
        element: (
          <section ref={el => { sectionRefs.current[idx] = el; }}>
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
        ),
      });
    });
  }

  // Glossary
  if (structured?.glossary && structured.glossary.length > 0) {
    const idx = sectionCounter++;
    contentSections.push({
      key: `glossary-${idx}`,
      element: (
        <section ref={el => { sectionRefs.current[idx] = el; }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-1 rounded-full bg-marker-blue" />
            <h2 className="text-[18px] font-semibold text-foreground">Glossary</h2>
          </div>
          <dl className="space-y-2.5 ml-4">
            {structured.glossary!.map((item, i) => (
              <div key={i}>
                <dt className="text-[15px] font-semibold text-foreground inline">{item.term}</dt>
                <dd className="text-[15px] text-secondary-foreground inline"> — {item.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      ),
    });
  }

  // Questions
  if (structured?.questions && structured.questions.length > 0) {
    const idx = sectionCounter++;
    contentSections.push({
      key: `questions-${idx}`,
      element: (
        <section ref={el => { sectionRefs.current[idx] = el; }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-1 rounded-full bg-marker-orange" />
            <h2 className="text-[18px] font-semibold text-foreground">Review Questions</h2>
          </div>
          <ol className="space-y-2.5 ml-4">
            {structured.questions!.map((q, i) => (
              <li key={i} className="text-[15px] text-secondary-foreground leading-[1.8] flex items-start gap-3">
                <span className="text-muted-foreground font-medium shrink-0 w-5 text-right">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </section>
      ),
    });
  }

  // Fallback
  if (!hasStructured && content) {
    const idx = sectionCounter++;
    contentSections.push({
      key: `fallback-${idx}`,
      element: (
        <section ref={el => { sectionRefs.current[idx] = el; }}>
          <div className="text-[15px] text-secondary-foreground whitespace-pre-wrap leading-[1.8]">
            {content}
          </div>
        </section>
      ),
    });
  }

  // Reset refs array length
  sectionRefs.current.length = sectionCounter;

  // Helper to render insights for a given section index
  const renderInsightsForSection = (sectionIdx: number) => {
    const sectionInsights = insights.filter(ins => insightSectionMap[ins.id] === sectionIdx);
    if (sectionInsights.length === 0) return null;

    return sectionInsights.map((insight, i) => {
      const isLatest = insight.id === insights[insights.length - 1]?.id;
      return (
        <div
          key={insight.id}
          ref={isLatest ? latestInsightRef : undefined}
          className="group animate-fade-in mt-4"
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-lg relative">
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
      );
    });
  };

  // Render loading indicator for pending section
  const renderLoadingForSection = (sectionIdx: number) => {
    if (!loadingInsight || pendingSectionIndex !== sectionIdx) return null;
    return (
      <div className="mt-4 animate-fade-in">
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl border border-border bg-card">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Generating AI insight...</span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[900px] mx-auto px-8 md:px-12 py-10" ref={containerRef}>
      {/* Title */}
      <h1 className="text-[30px] font-bold text-foreground leading-tight tracking-tight mb-4">
        {prettifyTitle(structured?.title || title)}
      </h1>

      {/* Summary */}
      {(summary || structured?.oneLineSummary) && (
        <p className="text-[15px] text-secondary-foreground leading-[1.8] mb-10">
          {summary || structured?.oneLineSummary}
        </p>
      )}

      {!summary && !structured?.oneLineSummary && <div className="mb-8" />}

      {/* Document sections with inline insights */}
      <div className="space-y-10">
        {contentSections.map((sec, idx) => (
          <div key={sec.key}>
            {sec.element}
            {renderInsightsForSection(idx)}
            {renderLoadingForSection(idx)}
          </div>
        ))}
      </div>

      {/* Loading fallback when no section identified */}
      {loadingInsight && pendingSectionIndex === null && (
        <div className="mt-8 flex items-center gap-3 py-3 animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Generating AI insight...</span>
        </div>
      )}

      {/* Floating toolbar */}
      {toolbarPos && (
        <div
          className="absolute z-50 flex items-center rounded-2xl bg-card/95 backdrop-blur-md border border-border/60 px-1 py-0.5 shadow-2xl shadow-black/10 animate-fade-in"
          style={{
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {ALL_ACTIONS.map((action, i) => {
            const icons: Record<string, React.ElementType> = {
              'Explain': Star,
              'Simplify': Layers,
              'Summarise': AlignLeft,
              'Ask question': HelpCircle,
            };
            const Icon = icons[action] || Star;
            return (
              <React.Fragment key={action}>
                {i > 0 && <div className="w-px h-5 bg-border/50 shrink-0" />}
                <button
                  className="text-[12px] px-3.5 py-2 rounded-xl hover:bg-accent/80 text-muted-foreground hover:text-foreground transition-all duration-150 font-medium flex items-center gap-1.5 active:scale-95"
                  onClick={() => handleAction(action)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action === 'Ask question' ? 'Ask AI' : action}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
