import { NotesProcessingState } from './NotesProcessingState';
import { NotesReadyState, StructuredNote, NoteInsight } from './NotesReadyState';
import { NotesErrorState } from './NotesErrorState';
import { EmptyState } from './EmptyState';

export interface NoteDisplay {
  id: string;
  title: string;
  content: string;
  status: 'processing' | 'ready' | 'failed';
  error_message?: string | null;
  summary?: string | null;
  structured?: StructuredNote | null;
}

interface Props {
  note: NoteDisplay | null;
  onRetry?: () => void;
  onBack?: () => void;
  insights: NoteInsight[];
  loadingInsight: boolean;
  onHighlightAction: (action: string, selectedText: string) => void;
  onRemoveInsight: (id: string) => void;
  onNoteCreated?: (noteId: string) => void;
  aiPanelOpen?: boolean;
}

export const NotesPanel = ({ note, onRetry, onBack, insights, loadingInsight, onHighlightAction, onRemoveInsight, onNoteCreated, aiPanelOpen }: Props) => {
  if (!note) {
    return <EmptyState onNoteCreated={onNoteCreated} />;
  }

  if (note.status === 'processing') {
    return <NotesProcessingState />;
  }

  if (note.status === 'failed') {
    return (
      <NotesErrorState
        errorMessage={note.error_message}
        onRetry={onRetry || (() => {})}
        onBack={onBack || (() => {})}
      />
    );
  }

  return (
    <NotesReadyState
      title={note.title}
      content={note.content || ''}
      summary={note.summary}
      structured={note.structured}
      insights={insights}
      loadingInsight={loadingInsight}
      onHighlightAction={onHighlightAction}
      onRemoveInsight={onRemoveInsight}
      aiPanelOpen={aiPanelOpen}
    />
  );
};
