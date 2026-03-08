import { NotesProcessingState } from './NotesProcessingState';
import { NotesReadyState, StructuredNote } from './NotesReadyState';
import { NotesErrorState } from './NotesErrorState';

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
}

export const NotesPanel = ({ note, onRetry, onBack }: Props) => {
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select or create a note to get started.</p>
      </div>
    );
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
    />
  );
};
