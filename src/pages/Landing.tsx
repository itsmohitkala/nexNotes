import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Link2, Type, Upload, Zap, Layers } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const Landing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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

  const handleProcess = async () => {
    if (!url && !text && !file) {
      toast.error('Please provide a URL, text, or file to process.');
      return;
    }

    if (!user) {
      toast.error('Please sign in first.');
      return;
    }

    setProcessing(true);
    try {
      const webhookUrl = 'https://n8n.srv1006534.hstgr.cloud/webhook-test/f29d58c6-3923-4ddb-9426-85667b7d8266';

      const isPdf = file && file.type === 'application/pdf';
      const sourceType = isPdf ? 'pdf' : url ? 'url' : 'text';
      const title = file?.name?.replace(/\.pdf$/i, '') || url || 'Untitled';

      // Generate a noteId upfront for storage path
      const noteId = crypto.randomUUID();
      let storagePath: string | null = null;

      // 1. If PDF, upload to storage FIRST
      if (isPdf && file) {
        storagePath = `${user.id}/${noteId}/source.pdf`;
        console.log('Selected file:', file.name, file.size, file.type);
        console.log('Storage path:', storagePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(storagePath, file, {
            upsert: false,
            contentType: 'application/pdf',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Upload failed: ${uploadError.message}`);
          setProcessing(false);
          return;
        }
        console.log('Upload response:', uploadData);
      }

      // 2. Insert note into database (only after upload succeeds)
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({ id: noteId, user_id: user.id, title })
        .select('id')
        .single();

      if (noteError || !noteData) throw new Error('Failed to create note');
      console.log('Note created:', noteData.id);

      // 3. Call n8n webhook
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          noteId: noteData.id,
          sourceType,
          sourceRef: isPdf ? storagePath : (url || null),
          rawText: text || null,
          title,
        }),
      });

      if (!res.ok) throw new Error('Processing failed');

      toast.success('Resource processed successfully!');
      navigate('/workspace');
    } catch (err) {
      console.error(err);
      toast.error('Failed to process resource. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold text-foreground">NexNotes</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/workspace">
                <Button variant="ghost" size="sm">Workspace</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>Log out</Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Your cognitive workspace
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Paste a link, drop a file, or type text — NexNotes transforms it into structured, AI-powered notes.
            </p>
          </div>

          {/* Import Card */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5 glow-border">
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
              <Type className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
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
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 cursor-pointer transition-colors ${
                dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-muted-foreground/40'
              }`}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              {file ? (
                <p className="text-sm text-foreground">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Drop a file here or <span className="text-accent">browse</span>
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

            <Button
              className="w-full"
              size="lg"
              onClick={handleProcess}
              disabled={processing}
            >
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

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-accent" />
              AI-powered extraction
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-accent" />
              Instant structuring
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
