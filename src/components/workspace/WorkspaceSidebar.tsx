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

  const recentNotes = filtered.slice(0, 5);
  const olderNotes = filtered.slice(5);

  return (
    <aside className="w-[260px] border-r border-border bg-sidebar flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground text-body">NexNotes</span>
        </div>
      </div>

      {/* Create + Search */}
      <div className="px-3 space-y-2 pb-3">
        <Button 
          size="sm" 
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9"
          onClick={onCreateNote}
        >
          <Plus className="h-4 w-4" /> Create Note
        </Button>
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="border-t border-border mx-3" />

      {/* Notes list */}
      <div className="flex-1 overflow-auto px-3 py-3 space-y-4">
        {recentNotes.length > 0 && (
          <div className="space-y-1">
            <p className="text-caption text-muted-foreground px-2 pb-1 uppercase tracking-wider font-medium flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Recent
            </p>
            {recentNotes.map((note) => (
              <NoteItem 
                key={note.id} 
                note={note} 
                isActive={note.id === activeNoteId}
                onSelect={onSelectNote}
              />
            ))}
          </div>
        )}

        {olderNotes.length > 0 && (
          <div className="space-y-1">
            <p className="text-caption text-muted-foreground px-2 pb-1 uppercase tracking-wider font-medium">
              All Notes
            </p>
            {olderNotes.map((note) => (
              <NoteItem 
                key={note.id} 
                note={note} 
                isActive={note.id === activeNoteId}
                onSelect={onSelectNote}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-caption text-muted-foreground text-center py-8">No notes found</p>
        )}
      </div>
    </aside>
  );
};

function NoteItem({ note, isActive, onSelect }: { note: NoteData; isActive: boolean; onSelect: (id: string) => void }) {
  const timeAgo = note.created_at 
    ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
    : '';

  return (
    <button
      onClick={() => onSelect(note.id)}
      className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-all duration-150 group ${
        isActive
          ? 'bg-primary/10 text-foreground border border-primary/20'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <FileText className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
        <div className="flex-1 min-w-0">
          <span className="truncate block font-medium">{note.title}</span>
          {timeAgo && (
            <span className="text-caption text-muted-foreground truncate block mt-0.5">{timeAgo}</span>
          )}
        </div>
      </div>
    </button>
  );
}
