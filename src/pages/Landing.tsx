import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Link2, Type, Upload, Zap, Sparkles } from 'lucide-react';
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
      const webhookUrl = 'https://n8n.srv1006534.hstgr.cloud/webhook/f29d58c6-3923-4ddb-9426-85667b7d8266';

      const isPdf = file && file.type === 'application/pdf';
      const sourceType = isPdf ? 'pdf' : url ? 'url' : 'text';
      const title = file?.name?.replace(/\.pdf$/i, '') || url || 'Untitled';

      const noteId = crypto.randomUUID();
      let storagePath: string | null = null;

      if (isPdf && file) {
        storagePath = `${user.id}/${noteId}/source.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(storagePath, file, {
            upsert: false,
            contentType: 'application/pdf',
          });

        if (uploadError) {
          toast.error(`Upload failed: ${uploadError.message}`);
          setProcessing(false);
          return;
        }
      }

      let fileUrl: string | null = null;
      if (isPdf && storagePath) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('uploads')
          .createSignedUrl(storagePath, 60 * 60);
        if (!signedUrlError) {
          fileUrl = signedUrlData.signedUrl;
        }
      }

      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({ id: noteId, user_id: user.id, title })
        .select('id')
        .single();

      if (noteError || !noteData) throw new Error('Failed to create note');

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          noteId: noteData.id,
          sourceType,
          sourceRef: isPdf ? storagePath : (url || null),
          fileUrl,
          rawText: text || null,
          title,
        }),
      });

      if (!res.ok) throw new Error('Processing failed');

      toast.success('Resource processed successfully!');
      navigate(`/workspace?noteId=${noteData.id}`);
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
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-card/30">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-semibold text-foreground">NexNotes</span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/workspace">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Workspace</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">Log out</Button>
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
        <div className="w-full max-w-2xl space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Your cognitive workspace
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
              Paste a link, drop a file, or type text — NexNotes transforms it into structured, AI-powered notes.
            </p>
          </div>

          {/* Import Card */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 card-elevated">
            {/* URL Input */}
            <div className="flex items-center gap-3 rounded-lg bg-muted border border-border px-4 py-3 focus-within:border-primary/40 transition-colors">
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
            <div className="flex items-start gap-3 rounded-lg bg-muted border border-border px-4 py-3 focus-within:border-primary/40 transition-colors">
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
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 cursor-pointer transition-all duration-200 ${
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
              }`}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              {file ? (
                <p className="text-sm text-foreground font-medium">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Drop a file here or <span className="text-primary font-medium">browse</span>
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Process & Generate Notes
                </span>
              )}
            </Button>
          </div>

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-8 text-caption text-muted-foreground">
            <span className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              AI-powered extraction
            </span>
            <span className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Instant structuring
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
