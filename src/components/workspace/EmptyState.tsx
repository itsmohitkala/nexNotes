import { FileText, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateNote?: () => void;
}

export const EmptyState = ({ onCreateNote }: EmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-10 max-w-md text-center animate-fade-in">
        {/* Icon */}
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-muted/30 border border-border/40 flex items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
            <Plus className="h-3 w-3 text-primary" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            Select or create a note
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your AI-powered notes will appear here. Get started by creating a new note or uploading a file.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            size="default"
            className="gap-2 rounded-xl px-6 h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Note
          </Button>
          <Button
            variant="outline"
            size="default"
            className="gap-2 rounded-xl px-6 h-11 border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium text-sm"
          >
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
