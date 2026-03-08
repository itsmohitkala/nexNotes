import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, AlignLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteCreated: (note: { title: string; content: string }) => void;
}

export const CreateNoteDialog = ({ open, onOpenChange, onNoteCreated }: Props) => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const reset = () => {
    setUrl('');
    setText('');
    setFile(null);
  };

  const handleProcess = async () => {
    if (!url && !text && !file) {
      toast.error('Please provide a URL, text, or file to process.');
      return;
    }

    setProcessing(true);
    try {
      const webhookUrl = 'https://n8n.srv1006534.hstgr.cloud/webhook/f29d58c6-3923-4ddb-9426-85667b7d8266';

      const formData = new FormData();
      if (url) formData.append('url', url);
      if (text) formData.append('text', text);
      if (file) formData.append('file', file);
      if (user) formData.append('user_id', user.id);

      const res = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Processing failed');

      const title = url
        ? new URL(url).hostname.replace('www.', '')
        : file
        ? file.name.replace(/\.[^/.]+$/, '')
        : text.slice(0, 40) || 'New Note';

      onNoteCreated({ title, content: text || `Processed from ${url || file?.name || 'input'}` });
      toast.success('Note created successfully!');
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to process. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* URL Input */}
          <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="url"
              placeholder="Paste a URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
            />
          </div>

          {/* Text Input */}
          <div className="flex items-start gap-3 rounded-lg bg-secondary px-4 py-3">
            <ClipboardPaste className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <textarea
              placeholder="Or type / paste text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none resize-none"
            />
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 cursor-pointer transition-colors ${
              dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-muted-foreground/40'
            }`}
          >
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            {file ? (
              <p className="text-sm text-foreground">{file.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Drop a file or <span className="text-accent">browse</span>
              </p>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
          </div>

          <Button className="w-full" onClick={handleProcess} disabled={processing}>
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Process & Generate Notes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
