import { useState } from 'react';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { NotesPanel } from '@/components/workspace/NotesPanel';
import { AiAssistant } from '@/components/workspace/AiAssistant';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, PanelLeftClose, PanelLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export interface NoteData {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Workspace = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteData[]>([
    {
      id: '1',
      title: 'React Reconciliation',
      content: `React Reconciliation is the process by which React updates the real DOM to match the virtual DOM.

Key Steps:
- Compare virtual DOM with previous version
- Identify changes
- Update only necessary elements

Benefits:
- Improves performance
- Reduces unnecessary re-rendering`,
      created_at: new Date().toISOString(),
    },
  ]);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null;

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
        {/* Sidebar */}
        {sidebarOpen && (
          <WorkspaceSidebar
            notes={notes}
            activeNoteId={activeNote?.id || null}
            onSelectNote={setActiveNoteId}
            onCreateNote={() => navigate('/')}
          />
        )}


        {/* Content + AI */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <NotesPanel note={activeNote} />
          </div>
          <AiAssistant note={activeNote} />
        </div>
      </div>
    </div>
  );
};

export default Workspace;
