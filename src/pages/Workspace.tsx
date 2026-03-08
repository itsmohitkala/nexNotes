import { useState, useEffect, useCallback } from 'react';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { NotesPanel, NoteDisplay } from '@/components/workspace/NotesPanel';
import { AiAssistant } from '@/components/workspace/AiAssistant';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, PanelLeftClose, PanelLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Fetch a single note by ID, including note_outputs
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

    // Fetch structured output if ready
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

  // Fetch sidebar notes list
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

  // Set active note from URL
  useEffect(() => {
    if (noteIdFromUrl) setActiveNoteId(noteIdFromUrl);
  }, [noteIdFromUrl]);

  // Fetch active note + realtime subscription
  useEffect(() => {
    if (!activeNoteId) {
      setNote(null);
      return;
    }

    // Initial fetch
    const loadNote = async () => {
      setLoading(true);
      const fetched = await fetchNote(activeNoteId);
      setLoading(false);
      if (fetched) setNote(fetched);
      else setNote(null);
    };
    loadNote();

    // Realtime subscription for instant updates
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

          // Fetch structured output when note becomes ready
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
      // Reset and re-poll
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

  // Convert for sidebar (legacy shape)
  const activeNoteForAssistant = note && note.status === 'ready'
    ? { id: note.id, title: note.title, content: note.content, created_at: '' }
    : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <span className="font-semibold text-foreground text-sm">NexNotes</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSignOut}>Log out</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <WorkspaceSidebar
            notes={sidebarNotes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onCreateNote={() => navigate('/')}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {loading && !note ? (
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            ) : (
              <NotesPanel note={note} onRetry={handleRetry} onBack={handleBack} />
            )}
          </div>
          <AiAssistant note={activeNoteForAssistant} />
        </div>
      </div>
    </div>
  );
};

export default Workspace;
