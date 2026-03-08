import { NoteData } from '@/pages/Workspace';
import { prettifyTitle } from '@/lib/format-title';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Settings, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

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
    <aside className="w-[260px] border-r border-border bg-card flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NexNotes" className="h-7 w-7 rounded-md" />
          <span className="text-[16px] font-semibold text-foreground tracking-tight">NexNotes</span>
        </Link>
      </div>

      {/* Create + Search */}
      <div className="px-4 space-y-3 pb-5">
        <Button
          size="sm"
          className="w-full justify-start gap-2 h-10 text-[13px] bg-accent hover:bg-accent/80 text-foreground border border-border"
          variant="outline"
          onClick={onCreateNote}
        >
          <Plus className="h-4 w-4" /> New Note
        </Button>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-background border border-border">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Your Notes label + list */}
      <div className="overflow-auto flex flex-col min-h-0 flex-1">
        <div className="px-5 pt-4 pb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Your Notes
          </span>
        </div>
        <div className="px-3 pb-2">
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
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{prettifyTitle(note.title)}</span>
                  {timeAgo && (
                    <span className="block text-[11px] text-muted-foreground/60 mt-0.5">{timeAgo}</span>
                  )}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-[13px] text-muted-foreground text-center py-8">No notes yet</p>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border flex items-center gap-1">
        <Link to="/settings" className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Settings className="h-4 w-4" />
        </Link>
        <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
