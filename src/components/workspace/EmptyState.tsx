import { FileText, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-section-title text-foreground">Select or create a note to begin</h2>
          <p className="text-body text-muted-foreground">
            Upload a document or create a new note to start building your knowledge base.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/')} className="gap-2">
            <Plus className="h-4 w-4" /> Create Note
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>
    </div>
  );
};
