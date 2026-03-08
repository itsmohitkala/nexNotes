import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link2, Type, Upload, ArrowRight } from 'lucide-react';
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
      <header className="flex items-center justify-between px-6 h-14 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-foreground">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-foreground tracking-tight">NexNotes</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/workspace">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-[13px]">Workspace</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground text-[13px]">Log out</Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-[13px] border-border text-muted-foreground hover:text-foreground hover:bg-accent">Sign in</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Your AI-powered knowledge workspace
            </h1>
            <p className="text-muted-foreground text-[15px] max-w-md mx-auto leading-relaxed">
              Drop a file, paste a link, or type text — NexNotes instantly turns it into organized notes you can read, explore, and learn from.
            </p>
          </div>

          {/* Import area */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {/* URL Input */}
            <div className="flex items-center gap-3 rounded-lg bg-background border border-border px-4 py-2.5 focus-within:border-muted-foreground/30 transition-colors">
              <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="url"
                placeholder="Paste a URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-[14px] outline-none"
              />
            </div>

            {/* Text Input */}
            <div className="flex items-start gap-3 rounded-lg bg-background border border-border px-4 py-2.5 focus-within:border-muted-foreground/30 transition-colors">
              <Type className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <textarea
                placeholder="Or type / paste text..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-[14px] outline-none resize-none"
              />
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-7 cursor-pointer transition-all duration-200 ${
                dragging ? 'border-muted-foreground/40 bg-accent/50' : 'border-border hover:border-muted-foreground/30 hover:bg-accent/30'
              }`}
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              {file ? (
                <p className="text-[13px] text-foreground font-medium">{file.name}</p>
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  Drop a file here or <span className="text-foreground font-medium">browse</span>
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
              className="w-full bg-accent hover:bg-accent/80 text-foreground border border-border"
              size="lg"
              onClick={handleProcess}
              disabled={processing}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Process & Generate Notes
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
