import { FileText, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-5 max-w-xs text-center animate-fade-in">
        <FileText className="h-10 w-10 text-muted-foreground/30" />
        <div className="space-y-1.5">
          <h2 className="text-base font-medium text-foreground">Select or create a note to begin</h2>
          <p className="text-sm text-muted-foreground">
            Your AI-powered notes will appear here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/')} size="sm" className="gap-1.5 rounded-lg">
            <Plus className="h-3.5 w-3.5" /> Create Note
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} size="sm" className="gap-1.5 rounded-lg">
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
