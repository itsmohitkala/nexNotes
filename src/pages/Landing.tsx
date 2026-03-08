import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NoteImportForm } from '@/components/workspace/NoteImportForm';

const Landing = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
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

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <NoteImportForm />
      </main>
    </div>
  );
};

export default Landing;
