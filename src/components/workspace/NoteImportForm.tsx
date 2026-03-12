import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { N8N_PROCESS_WEBHOOK } from "@/lib/n8n-api";

interface NoteImportFormProps {
  onNoteCreated?: (noteId: string) => void;
}

export const NoteImportForm = ({ onNoteCreated }: NoteImportFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
    else if (f) toast.error("Please upload a PDF file.");
  }, []);

  const handleProcess = async () => {
    if (!file) {
      toast.error("Please upload a PDF to continue.");
      return;
    }

    if (!user) {
      toast.error("Please sign in first.");
      return;
    }

    setProcessing(true);
    try {
      const webhookUrl = N8N_PROCESS_WEBHOOK;

      const title = file.name.replace(/\.pdf$/i, "");
      const noteId = crypto.randomUUID();
      const storagePath = `${user.id}/${noteId}/source.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(storagePath, file, {
          upsert: false,
          contentType: "application/pdf",
        });

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        setProcessing(false);
        return;
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("uploads")
          .createSignedUrl(storagePath, 60 * 60);

      const fileUrl = signedUrlError ? null : signedUrlData.signedUrl;

      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .insert({ id: noteId, user_id: user.id, title })
        .select("id")
        .single();

      if (noteError || !noteData) throw new Error("Failed to create note");

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          noteId: noteData.id,
          sourceType: "pdf",
          sourceRef: storagePath,
          fileUrl,
          rawText: null,
          title,
        }),
      });

      if (!res.ok) throw new Error("Processing failed");

      if (onNoteCreated) {
        onNoteCreated(noteData.id);
      } else {
        navigate(`/workspace?noteId=${noteData.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process PDF. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
          Think Less. Learn Faster.
        </h1>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          Upload a PDF — NexNotes builds clean, interactive notes you can
          explore and learn from.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-10 cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-muted-foreground/40 bg-accent/50"
              : file
              ? "border-muted-foreground/30 bg-accent/20"
              : "border-border hover:border-muted-foreground/30 hover:bg-accent/20"
          }`}
        >
          {file ? (
            <>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div className="text-center">
                <p className="text-[13px] text-foreground font-medium">
                  {file.name}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                  <span
                    className="underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove
                  </span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[13px] text-foreground font-medium">
                  Drop a PDF here or{" "}
                  <span className="text-muted-foreground">browse</span>
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Supports PDF documents
                </p>
              </div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
        </div>

        <Button
          className="w-full h-11 bg-accent hover:bg-accent/80 text-foreground border border-border text-[14px] font-medium"
          onClick={handleProcess}
          disabled={processing || !file}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Generate Notes from PDF
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
