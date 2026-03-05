import { NoteData } from '@/pages/Workspace';
import { Button } from '@/components/ui/button';
import { Plus, Search, Share2, FileText } from 'lucide-react';
import { useState } from 'react';

interface Props {
  notes: NoteData[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
}

export const WorkspaceSidebar = ({ notes, activeNoteId, onSelectNote, onCreateNote }: Props) => {
  const [search, setSearch] = useState('');

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div className="p-3 space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={onCreateNote}>
          <Plus className="h-4 w-4" /> Create Note
        </Button>
        <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
          <Share2 className="h-4 w-4" /> Share Notes
        </Button>
      </div>

      <div className="border-t border-border" />

      <div className="flex-1 overflow-auto p-2">
        <p className="text-xs text-muted-foreground px-2 py-1 uppercase tracking-wider">Your notes</p>
        {filtered.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              note.id === activeNoteId
                ? 'bg-accent/10 text-accent'
                : 'text-foreground hover:bg-secondary'
            }`}
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{note.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
