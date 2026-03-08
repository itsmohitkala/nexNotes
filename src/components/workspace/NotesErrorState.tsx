import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  errorMessage?: string | null;
  onRetry: () => void;
  onBack: () => void;
}

export const NotesErrorState = ({ errorMessage, onRetry, onBack }: Props) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-5 max-w-md text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Processing failed</h2>
          <p className="text-sm text-muted-foreground">
            {errorMessage || 'Something went wrong while processing your document. Please try again.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go back
          </Button>
          <Button size="sm" onClick={onRetry} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    </div>
  );
};
