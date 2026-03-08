import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileText, Sparkles, MessageSquare, Zap, GraduationCap, BookOpen, Briefcase, ChevronRight, ArrowRight, Highlighter, Brain, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Landing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-brand flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-foreground">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-foreground tracking-tight">NexNotes</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
          </nav>
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
                <Button size="sm" className="text-[13px] bg-brand text-brand-foreground hover:bg-brand-dark rounded-lg">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.h1 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                Turn Any Document<br />Into Smart AI Notes
              </motion.h1>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">
                Upload PDFs, articles, or text and instantly generate structured notes, summaries, and AI explanations you can interact with.
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="flex items-center gap-3">
                <Button
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand-dark rounded-xl px-6 h-12 text-[15px] font-semibold shadow-lg shadow-brand/20"
                  onClick={() => navigate(user ? '/workspace' : '/signup')}
                >
                  Start Making Notes <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-6 h-12 text-[15px] font-semibold border-border text-foreground hover:bg-accent"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See Demo
                </Button>
              </motion.div>
              <motion.p variants={fadeUp} custom={3} className="text-[13px] text-muted-foreground">
                No setup required • Works with PDFs, articles, and text
              </motion.p>
            </motion.div>

            {/* Right — Product Preview Mock */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-brand/5 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-accent/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-marker-orange/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-marker-green/60" />
                  <span className="ml-3 text-[11px] text-muted-foreground font-medium">NexNotes</span>
                </div>
                {/* Mock content */}
                <div className="grid grid-cols-5 min-h-[280px]">
                  {/* Sidebar mock */}
                  <div className="col-span-2 border-r border-border p-4 space-y-3 bg-accent/20">
                    <div className="text-[11px] font-semibold text-foreground mb-3">Your Notes</div>
                    {['Research Paper', 'Biology Ch.4', 'Meeting Notes'].map((t, i) => (
                      <div key={t} className={`text-[11px] px-2.5 py-2 rounded-lg transition-colors ${i === 0 ? 'bg-brand/10 text-brand border border-brand/20' : 'text-muted-foreground hover:bg-accent'}`}>
                        {t}
                      </div>
                    ))}
                  </div>
                  {/* Content mock */}
                  <div className="col-span-3 p-4 space-y-3">
                    <div className="text-[11px] font-semibold text-foreground">AI-Generated Notes</div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-full rounded-full bg-marker-blue shrink-0 self-stretch" />
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-marker-blue uppercase tracking-wider">Summary</div>
                          <div className="h-2 w-full rounded bg-muted" />
                          <div className="h-2 w-4/5 rounded bg-muted" />
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-full rounded-full bg-marker-purple shrink-0 self-stretch" />
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-marker-purple uppercase tracking-wider">Key Points</div>
                          <div className="h-2 w-full rounded bg-muted" />
                          <div className="h-2 w-3/5 rounded bg-muted" />
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-full rounded-full bg-marker-green shrink-0 self-stretch" />
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-marker-green uppercase tracking-wider">Concepts</div>
                          <div className="h-2 w-full rounded bg-muted" />
                          <div className="h-2 w-2/3 rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                    {/* Highlight action mock */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="text-[9px] px-2 py-1 rounded-md bg-brand/10 text-brand font-medium">Explain</div>
                      <div className="text-[9px] px-2 py-1 rounded-md bg-accent text-muted-foreground font-medium">Simplify</div>
                      <div className="text-[9px] px-2 py-1 rounded-md bg-accent text-muted-foreground font-medium">Ask AI</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Caption */}
              <p className="text-center text-[13px] text-muted-foreground mt-4">
                Study faster with AI-powered notes that understand your documents.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-border bg-accent/30">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl font-bold text-foreground text-center mb-14 tracking-tight"
          >
            See How It Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload Your Document', desc: 'PDF, article link, or text.', icon: FileText },
              { step: '2', title: 'AI Builds Your Notes', desc: 'The system extracts key ideas and organizes them.', icon: Brain },
              { step: '3', title: 'Interact with Your Notes', desc: 'Highlight text to explain, simplify, summarize, or ask questions.', icon: Highlighter },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-6 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-brand text-brand-foreground text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
                <div className="pt-2">
                  <div className="rounded-xl bg-accent/60 border border-border p-4 flex items-center justify-center h-28">
                    <item.icon className="h-10 w-10 text-brand/60" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl font-bold text-foreground text-center mb-14 tracking-tight"
          >
            Smart Features
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'AI Note Generation', desc: 'Convert long documents into structured notes instantly.' },
              { icon: Highlighter, title: 'Highlight & Simplify', desc: 'Explain concepts & simplify text with a single highlight.' },
              { icon: MessageSquare, title: 'Ask Questions', desc: 'Get contextual answers from your document.' },
              { icon: Zap, title: 'Quick Summaries', desc: 'Summarize key points in seconds.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 hover:border-brand/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand/10">
                  <f.icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section id="use-cases" className="border-t border-border bg-accent/30">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl font-bold text-foreground text-center mb-14 tracking-tight"
          >
            Perfect For
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: 'Students', desc: 'Turn textbooks and PDFs into study notes.' },
              { icon: BookOpen, title: 'Researchers', desc: 'Extract key insights from research papers.' },
              { icon: Briefcase, title: 'Professionals', desc: 'Understand reports and documentation faster.' },
            ].map((u, i) => (
              <motion.div
                key={u.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-8 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand/10">
                  <u.icon className="h-8 w-8 text-brand" />
                </div>
                <h3 className="text-base font-bold text-foreground">{u.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{u.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Output ── */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl font-bold text-foreground text-center mb-4 tracking-tight"
          >
            Before & After
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="text-center text-muted-foreground text-[15px] mb-12 max-w-md mx-auto"
          >
            See how NexNotes transforms a dense document into organized, actionable notes.
          </motion.p>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={2}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Before */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-destructive/70">Before</div>
              <div className="text-[13px] text-muted-foreground leading-[1.8] space-y-2">
                <p>The mitochondria, often referred to as the powerhouse of the cell, play a critical role in cellular respiration. Through the process of oxidative phosphorylation, they convert ADP into ATP, which serves as the primary energy currency for cellular functions…</p>
                <p>Additionally, mitochondria are involved in the regulation of metabolic pathways and have their own DNA, which is maternally inherited. Dysfunction in mitochondrial processes has been linked to a range of diseases…</p>
              </div>
            </div>
            {/* After */}
            <div className="rounded-2xl border border-brand/20 bg-card p-6 space-y-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-brand">After — AI Notes</div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 rounded-full bg-marker-blue self-stretch shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-marker-blue mb-1">Summary</div>
                    <p className="text-[13px] text-foreground leading-relaxed">Mitochondria are the energy producers of cells, converting ADP to ATP via oxidative phosphorylation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 rounded-full bg-marker-purple self-stretch shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-marker-purple mb-1">Key Points</div>
                    <ul className="text-[13px] text-foreground leading-relaxed space-y-1 list-disc list-inside">
                      <li>Known as "powerhouse of the cell"</li>
                      <li>Converts ADP → ATP (energy currency)</li>
                      <li>Has its own DNA (maternally inherited)</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 rounded-full bg-marker-green self-stretch shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-marker-green mb-1">AI Explanation</div>
                    <p className="text-[13px] text-foreground leading-relaxed">Think of mitochondria like tiny batteries inside every cell that recharge themselves to keep the cell running.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-accent/30">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Start Turning Documents<br />Into Smart Notes
            </motion.h2>
            <motion.div variants={fadeUp} custom={1}>
              <Button
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand-dark rounded-xl px-8 h-13 text-[15px] font-semibold shadow-lg shadow-brand/20"
                onClick={() => navigate(user ? '/workspace' : '/signup')}
              >
                Start Making Notes <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
            <motion.p variants={fadeUp} custom={2} className="text-[13px] text-muted-foreground">
              Free to try • No credit card required
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <span className="text-[13px] text-muted-foreground">© {new Date().getFullYear()} NexNotes</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
