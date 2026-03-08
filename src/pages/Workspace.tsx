import { useState, useEffect, useCallback } from 'react';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { NotesPanel, NoteDisplay } from '@/components/workspace/NotesPanel';
import { AiAssistant } from '@/components/workspace/AiAssistant';
import { NoteInsight } from '@/components/workspace/NotesReadyState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Bot, PanelLeftClose, PanelLeft, FileText, Download } from 'lucide-react';
import { downloadMarkdown, downloadPdf } from '@/lib/export-note';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { performHighlightAction } from '@/lib/n8n-api';

export interface NoteData {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Workspace = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const noteIdFromUrl = searchParams.get('noteId');

  const [note, setNote] = useState<NoteDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarNotes, setSidebarNotes] = useState<NoteData[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(noteIdFromUrl);

  const [insightsByNote, setInsightsByNote] = useState<Record<string, NoteInsight[]>>({});
  const [loadingInsightByNote, setLoadingInsightByNote] = useState<Record<string, boolean>>({});
  const [pendingQuestion, setPendingQuestion] = useState<{ question: string; selectedText: string } | null>(null);

  // Derived per-note state
  const insights = insightsByNote[activeNoteId ?? ''] ?? [];
  const loadingInsight = loadingInsightByNote[activeNoteId ?? ''] ?? false;

  const setInsights = useCallback((updater: NoteInsight[] | ((prev: NoteInsight[]) => NoteInsight[])) => {
    const nid = activeNoteId ?? '';
    setInsightsByNote(prev => {
      const current = prev[nid] ?? [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [nid]: next };
    });
  }, [activeNoteId]);

  const setLoadingInsight = useCallback((val: boolean) => {
    const nid = activeNoteId ?? '';
    setLoadingInsightByNote(prev => ({ ...prev, [nid]: val }));
  }, [activeNoteId]);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Clear transient state on note switch
  useEffect(() => {
    setPendingQuestion(null);
  }, [activeNoteId]);

  const fetchNote = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, status, error_message')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const noteDisplay: NoteDisplay = {
      id: data.id,
      title: data.title,
      content: data.content || '',
      status: (data.status || 'processing') as NoteDisplay['status'],
      error_message: data.error_message,
    };

    if (noteDisplay.status === 'ready') {
      const { data: output } = await supabase
        .from('note_outputs')
        .select('summary, structured')
        .eq('note_id', id)
        .single();

      if (output) {
        noteDisplay.summary = output.summary;
        noteDisplay.structured = output.structured as any;
      }
    }

    return noteDisplay;
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('notes')
        .select('id, title, content, created_at')
        .eq('user_id', user.id)
        .eq('status', 'ready')
        .order('created_at', { ascending: false });
      if (data) setSidebarNotes(data.map(n => ({ ...n, content: n.content || '', created_at: n.created_at || '' })));
    };
    load();
  }, [user]);

  useEffect(() => {
    if (noteIdFromUrl) setActiveNoteId(noteIdFromUrl);
  }, [noteIdFromUrl]);

  useEffect(() => {
    if (!activeNoteId) {
      setNote(null);
      return;
    }

    const loadNote = async () => {
      setLoading(true);
      const fetched = await fetchNote(activeNoteId);
      setLoading(false);
      if (fetched) setNote(fetched);
      else setNote(null);
    };
    loadNote();

    const channel = supabase
      .channel(`note-${activeNoteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${activeNoteId}`,
        },
        async (payload) => {
          const row = payload.new as any;
          const status = (row.status || 'processing') as NoteDisplay['status'];

          const updated: NoteDisplay = {
            id: row.id,
            title: row.title,
            content: row.content || '',
            status,
            error_message: row.error_message,
          };

          if (status === 'ready') {
            const { data: output } = await supabase
              .from('note_outputs')
              .select('summary, structured')
              .eq('note_id', row.id)
              .single();
            if (output) {
              updated.summary = output.summary;
              updated.structured = output.structured as any;
            }
            // Refresh sidebar when note becomes ready
            if (user) {
              const { data: sData } = await supabase
                .from('notes')
                .select('id, title, content, created_at')
                .eq('user_id', user.id)
                .eq('status', 'ready')
                .order('created_at', { ascending: false });
              if (sData) setSidebarNotes(sData.map(n => ({ ...n, content: n.content || '', created_at: n.created_at || '' })));
            }
          }

          setNote(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeNoteId, fetchNote]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleRetry = () => {
    if (activeNoteId) {
      setNote((prev) => prev ? { ...prev, status: 'processing' } : prev);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    navigate(`/workspace?noteId=${id}`, { replace: true });
  };

  const handleHighlightAction = async (action: string, selectedText: string, sectionIndex?: number) => {
    if (!user || !activeNoteId) return;

    if (action === 'Ask question') {
      const defaultAskPrompt = 'Can you explain this highlighted text?';
      setPendingQuestion({ question: defaultAskPrompt, selectedText });
      return;
    }

    setLoadingInsight(true);
    try {
      const res = await performHighlightAction({
        userId: user.id,
        noteId: activeNoteId,
        selectedText,
        action: action.toLowerCase() as 'explain' | 'simplify' | 'summarise',
      });
      setInsights((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          action,
          selectedText,
          answer: res.answer,
          sectionIndex,
        },
      ]);
    } catch {
      setInsights((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          action,
          selectedText,
          answer: 'Failed to get AI response. Please try again.',
          sectionIndex,
        },
      ]);
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleRemoveInsight = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  const activeNoteForAssistant = note && note.status === 'ready'
    ? { id: note.id, title: note.title, content: note.content, created_at: '' }
    : null;

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      {sidebarOpen && (
        <WorkspaceSidebar
          notes={sidebarNotes}
          activeNoteId={activeNoteId}
          onSelectNote={handleSelectNote}
          onCreateNote={() => { setActiveNoteId(null); setNote(null); }}
        />
      )}

      {/* Center + Right */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation bar */}
        <header className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Notes</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {note && note.status === 'ready' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                    title="Export note"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => downloadMarkdown(note.title, note.summary, note.structured, note.content)}>
                    Download as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadPdf(note.title, note.summary, note.structured, note.content)}>
                    Save as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {note && note.status === 'ready' && !aiPanelOpen && (
              <button
                onClick={() => setAiPanelOpen(true)}
                className="h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                title="Show AI Assistant"
              >
                <Bot className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={() => navigate('/settings')}
              className="h-7 w-7 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
              title="Settings"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-auto">
            {loading && !note ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  Loading…
                </div>
              </div>
            ) : (
              <NotesPanel
                note={note}
                onRetry={handleRetry}
                onBack={handleBack}
                insights={insights}
                loadingInsight={loadingInsight}
                onHighlightAction={handleHighlightAction}
                onRemoveInsight={handleRemoveInsight}
                onNoteCreated={(noteId) => {
                  handleSelectNote(noteId);
                  // Refresh sidebar
                  if (user) {
                    supabase
                      .from('notes')
                      .select('id, title, content, created_at')
                      .eq('user_id', user.id)
                      .eq('status', 'ready')
                      .order('created_at', { ascending: false })
                      .then(({ data }) => {
                        if (data) setSidebarNotes(data.map(n => ({ ...n, content: n.content || '', created_at: n.created_at || '' })));
                      });
                  }
                }}
              />
            )}
          </div>

          {/* Right AI Panel */}
          {note && note.status === 'ready' && aiPanelOpen && (
            <AiAssistant
              note={activeNoteForAssistant}
              pendingQuestion={pendingQuestion}
              onPendingHandled={() => setPendingQuestion(null)}
              onClose={() => setAiPanelOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
