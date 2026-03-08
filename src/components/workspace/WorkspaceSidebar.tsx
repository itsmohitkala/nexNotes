import { NoteData } from '@/pages/Workspace';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Clock } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

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
    <aside className="w-[240px] border-r border-border bg-background flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-sm font-semibold text-foreground tracking-tight">NexNotes</span>
      </div>

      {/* Create + Search */}
      <div className="px-3 space-y-1.5 pb-3">
        <Button 
          size="sm" 
          className="w-full justify-start gap-2 h-8 text-[13px] bg-primary/10 text-primary hover:bg-primary/15 border-0"
          variant="outline"
          onClick={onCreateNote}
        >
          <Plus className="h-3.5 w-3.5" /> New Note
        </Button>
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-muted/40">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-auto px-2 py-1">
        <p className="text-[11px] text-muted-foreground px-2 pb-2 uppercase tracking-widest font-medium">
          Recent
        </p>
        {filtered.map((note) => {
          const isActive = note.id === activeNoteId;
          const timeAgo = note.created_at 
            ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
            : '';

          return (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors mb-0.5 ${
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <span className="block truncate font-medium">{note.title}</span>
              {timeAgo && (
                <span className="block text-[11px] text-muted-foreground/70 mt-0.5">{timeAgo}</span>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-[13px] text-muted-foreground text-center py-8">No notes</p>
        )}
      </div>
    </aside>
  );
};
