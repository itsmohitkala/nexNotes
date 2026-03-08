import { FileText, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-8 max-w-sm text-center animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
          <FileText className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground tracking-tight">
            Select or create a note
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your AI-powered notes will appear here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="gap-2 rounded-lg px-4 h-9 bg-foreground text-background hover:bg-foreground/90 font-medium text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> New Note
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg px-4 h-9 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium text-xs"
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
