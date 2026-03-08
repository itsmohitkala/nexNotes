import { useState, useEffect, useCallback } from 'react';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { NotesPanel, NoteDisplay } from '@/components/workspace/NotesPanel';
import { AiAssistant } from '@/components/workspace/AiAssistant';
import { NoteInsight } from '@/components/workspace/NotesReadyState';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PanelLeftClose, PanelLeft, Settings, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const noteIdFromUrl = searchParams.get('noteId');

  const [note, setNote] = useState<NoteDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarNotes, setSidebarNotes] = useState<NoteData[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(noteIdFromUrl);

  const [insights, setInsights] = useState<NoteInsight[]>([]);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<{ question: string; selectedText: string } | null>(null);

  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setInsights([]);
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

  const handleHighlightAction = async (action: string, selectedText: string) => {
    if (!user || !activeNoteId) return;

    if (action === 'Ask question') {
      const defaultAskPrompt = 'Can you explain this highlighted text?';
      setPendingQuestion({ question: defaultAskPrompt, selectedText });
      if (!aiPanelOpen) setAiPanelOpen(true);
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
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0 bg-card/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          {note && (
            <div className="flex items-center gap-2 ml-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium truncate max-w-[300px]">{note.title}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground hover:text-foreground h-8">
            <LogOut className="h-3.5 w-3.5" /> Log out
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main area - 3 column layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <WorkspaceSidebar
            notes={sidebarNotes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onCreateNote={() => navigate('/')}
          />
        )}

        <div className="flex-1 overflow-auto bg-background">
          {loading && !note ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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
            />
          )}
        </div>

        <AiAssistant
          note={activeNoteForAssistant}
          pendingQuestion={pendingQuestion}
          onPendingHandled={() => setPendingQuestion(null)}
          isOpen={aiPanelOpen}
          onToggle={() => setAiPanelOpen(!aiPanelOpen)}
        />
      </div>
    </div>
  );
};

export default Workspace;
