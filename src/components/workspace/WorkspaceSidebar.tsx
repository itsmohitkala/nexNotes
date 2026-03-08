import { NoteData } from '@/pages/Workspace';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Menu, LayoutGrid, RefreshCw, Settings } from 'lucide-react';
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
    <aside className="w-[240px] border-r border-border bg-card flex flex-col shrink-0 h-full">
      {/* Logo + nav icons */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-foreground tracking-tight">NexNotes</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Menu className="h-3.5 w-3.5" />
          </button>
          <button className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Create + Search */}
      <div className="px-3 space-y-2 pb-3">
        <Button
          size="sm"
          className="w-full justify-start gap-2 h-9 text-[13px] bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onCreateNote}
        >
          <Plus className="h-3.5 w-3.5" /> New Note
        </Button>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-muted/30 border border-border/50">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-auto px-2 py-1">
        {filtered.map((note) => {
          const isActive = note.id === activeNoteId;
          const timeAgo = note.created_at
            ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
            : '';

          return (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all mb-0.5 flex items-start gap-2.5 ${
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium">{note.title}</span>
                {timeAgo && (
                  <span className="block text-[11px] text-muted-foreground/60 mt-0.5">{timeAgo}</span>
                )}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-[13px] text-muted-foreground text-center py-8">No notes</p>
        )}
      </div>

      {/* Bottom icons */}
      <div className="px-3 py-3 border-t border-border flex items-center gap-1">
        <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="h-4 w-4" />
        </button>
        <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
