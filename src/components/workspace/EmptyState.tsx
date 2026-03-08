import { NoteImportForm } from '@/components/workspace/NoteImportForm';

interface EmptyStateProps {
  onNoteCreated?: (noteId: string) => void;
}

export const EmptyState = ({ onNoteCreated }: EmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-12 animate-fade-in">
      <NoteImportForm onNoteCreated={onNoteCreated} />
    </div>
  );
};
