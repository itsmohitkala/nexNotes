import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Camera, Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>({ name: '', email: '', avatar_url: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('name, email, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (data) setProfile(data);
        if (error) console.error(error);
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name: profile.name, email: profile.email })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    const avatar_url = urlData.publicUrl;

    await supabase.from('profiles').update({ avatar_url }).eq('id', user.id);
    setProfile((p) => ({ ...p, avatar_url }));
    setUploading(false);
    toast.success('Avatar updated');
  };

  const initials = (profile.name || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workspace')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 space-y-10">
        {/* Avatar Section */}
        <section className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={profile.avatar_url || undefined} alt="Avatar" />
              <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-background" />
              ) : (
                <Camera className="h-5 w-5 text-background" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <p className="text-sm text-muted-foreground">Click to change avatar</p>
        </section>

        {/* Profile Form */}
        <section className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name || ''}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email || ''}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="your@email.com"
            />
            <p className="text-xs text-muted-foreground">
              This is your profile email, not your login email.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-destructive/30 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-destructive">Account</h2>
          <Button
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            Sign Out
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Settings;
