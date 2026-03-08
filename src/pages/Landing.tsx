import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileText, MessageSquare, Zap, GraduationCap, BookOpen, Briefcase, ArrowRight, Highlighter, Brain, Github, NotebookPen, Users, BotMessageSquare } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function AnimatedCounter({ target, suffix = '+' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) return `${(v / 1000).toFixed(v >= target ? 0 : 1)}K`;
    return Math.round(v).toString();
  });

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2, ease: 'easeOut' });
    }
  }, [isInView, count, target]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" as const },
  }),
};

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div className="text-center mb-16 space-y-3">
    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{children}</h2>
    {subtitle && <p className="text-muted-foreground text-[15px] max-w-lg mx-auto leading-relaxed">{subtitle}</p>}
  </div>
);

const Landing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ notes_count: 0, users_count: 0, ai_queries_count: 0 });

  useEffect(() => {
    supabase.rpc('get_public_stats').then(({ data }) => {
      if (data) setStats(data as typeof stats);
    });
  }, []);

  const handleCTA = () => navigate(user ? '/workspace' : '/signup');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="NexNotes" className="h-7 w-7 rounded-lg dark:invert" />
            <span className="text-[15px] font-bold text-foreground tracking-tight">NexNotes</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground font-medium">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/itsmohitkala"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/workspace">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-[13px] font-medium">Workspace</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground text-[13px] font-medium">Log out</Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="text-[13px] bg-brand text-brand-foreground hover:bg-brand-dark rounded-lg font-medium h-8 px-4">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" className="space-y-7">
              <motion.h1 variants={fadeUp} custom={0} className="text-4xl md:text-[3.25rem] font-bold tracking-tight text-foreground leading-[1.08]">
                Turn Any Document<br />Into Smart AI Notes
              </motion.h1>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-[15px] md:text-base leading-relaxed max-w-[420px]">
                Upload PDFs, articles, or text and instantly generate structured notes, summaries, and AI explanations you can interact with.
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="flex items-center gap-3 pt-1">
                <Button
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand-dark rounded-xl px-7 h-12 text-[14px] font-semibold shadow-lg shadow-brand/25"
                  onClick={handleCTA}
                >
                  Start Making Notes <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-7 h-12 text-[14px] font-semibold border-border text-foreground hover:bg-accent"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See Demo
                </Button>
              </motion.div>
              <motion.p variants={fadeUp} custom={3} className="text-[12px] text-muted-foreground tracking-wide">
                No setup required &nbsp;•&nbsp; Works with PDFs, articles, and text
              </motion.p>
            </motion.div>

            {/* Product Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
            >
              <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-brand/5 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-accent/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-marker-orange/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-marker-green/50" />
                  <span className="ml-3 text-[10px] text-muted-foreground font-medium tracking-wide">NexNotes</span>
                </div>
                <div className="grid grid-cols-5 min-h-[260px]">
                  <div className="col-span-2 border-r border-border p-3.5 space-y-2 bg-accent/20">
                    <div className="text-[10px] font-semibold text-foreground mb-2.5 tracking-wide">Your Notes</div>
                    {['Research Paper', 'Biology Ch.4', 'Meeting Notes'].map((t, i) => (
                      <div key={t} className={`text-[10px] px-2.5 py-1.5 rounded-lg ${i === 0 ? 'bg-brand/10 text-brand border border-brand/20 font-medium' : 'text-muted-foreground'}`}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="col-span-3 p-3.5 space-y-3">
                    <div className="text-[10px] font-semibold text-foreground tracking-wide">AI-Generated Notes</div>
                    <div className="space-y-2.5">
                      {[
                        { color: 'bg-marker-blue', textColor: 'text-marker-blue', label: 'Summary', w1: 'w-full', w2: 'w-4/5' },
                        { color: 'bg-marker-purple', textColor: 'text-marker-purple', label: 'Key Points', w1: 'w-full', w2: 'w-3/5' },
                        { color: 'bg-marker-green', textColor: 'text-marker-green', label: 'Concepts', w1: 'w-full', w2: 'w-2/3' },
                      ].map((s) => (
                        <div key={s.label} className="flex items-start gap-2">
                          <div className={`w-1 rounded-full ${s.color} self-stretch shrink-0`} />
                          <div className="space-y-1 flex-1">
                            <div className={`text-[9px] font-semibold ${s.textColor} uppercase tracking-widest`}>{s.label}</div>
                            <div className={`h-1.5 ${s.w1} rounded-full bg-muted`} />
                            <div className={`h-1.5 ${s.w2} rounded-full bg-muted`} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="text-[8px] px-2 py-0.5 rounded bg-brand/10 text-brand font-semibold">Explain</div>
                      <div className="text-[8px] px-2 py-0.5 rounded bg-accent text-muted-foreground font-medium">Simplify</div>
                      <div className="text-[8px] px-2 py-0.5 rounded bg-accent text-muted-foreground font-medium">Ask AI</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-[12px] text-muted-foreground mt-4 tracking-wide">
                Study faster with AI-powered notes that understand your documents.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-border bg-accent/20">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <SectionHeading>See How It Works</SectionHeading>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Upload Your Document', desc: 'PDF, article link, or text.', icon: FileText },
              { step: '2', title: 'AI Builds Your Notes', desc: 'Extracts key ideas and organizes them into structured notes.', icon: Brain },
              { step: '3', title: 'Interact with Your Notes', desc: 'Highlight to explain, simplify, summarize, or ask questions.', icon: Highlighter },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-7 text-center flex flex-col items-center"
              >
                <div className="h-10 w-10 rounded-full bg-brand text-brand-foreground text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-[15px] font-semibold text-foreground mt-4">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[220px] mt-2 min-h-[40px]">{item.desc}</p>
                <div className="w-full mt-auto pt-5">
                  <div className="rounded-xl bg-accent/50 border border-border flex items-center justify-center h-24">
                    <item.icon className="h-9 w-9 text-brand/50" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <SectionHeading>Smart Features</SectionHeading>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                className="rounded-2xl border border-border bg-card p-6 text-center space-y-3 hover:border-brand/30 hover:shadow-sm transition-all duration-200 flex flex-col items-center"
              >
                <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-[14px] font-semibold text-foreground">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section id="use-cases" className="border-t border-border bg-accent/20">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <SectionHeading>Perfect For</SectionHeading>
          </motion.div>
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
                className="rounded-2xl border border-border bg-card p-8 text-center space-y-4 flex flex-col items-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <u.icon className="h-7 w-7 text-brand" />
                </div>
                <h3 className="text-[15px] font-bold text-foreground">{u.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{u.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Counter ── */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <SectionHeading subtitle="Growing every day with users who love smarter notes.">
              By the Numbers
            </SectionHeading>
          </motion.div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: NotebookPen, value: stats.notes_count + 100, label: 'Notes Created' },
              { icon: Users, value: stats.users_count + 100, label: 'Happy Users' },
              { icon: BotMessageSquare, value: stats.ai_queries_count + 100, label: 'AI Queries' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="rounded-2xl border border-border bg-card p-8 text-center space-y-3 flex flex-col items-center hover:border-brand/30 transition-colors duration-200"
              >
                <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-brand" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  <AnimatedCounter target={stat.value} />
                </div>
                <p className="text-[13px] text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before & After ── */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <SectionHeading subtitle="See how NexNotes transforms a dense document into organized, actionable notes.">
              Before &amp; After
            </SectionHeading>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="rounded-2xl border border-border bg-card p-7 space-y-4">
              <div className="inline-flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-destructive/10 flex items-center justify-center">
                  <FileText className="h-3 w-3 text-destructive/70" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-destructive/70">Before</span>
              </div>
              <div className="text-[13px] text-muted-foreground leading-[1.8] space-y-3">
                <p>The mitochondria, often referred to as the powerhouse of the cell, play a critical role in cellular respiration. Through the process of oxidative phosphorylation, they convert ADP into ATP, which serves as the primary energy currency for cellular functions…</p>
                <p>Additionally, mitochondria are involved in the regulation of metabolic pathways and have their own DNA, which is maternally inherited. Dysfunction in mitochondrial processes has been linked to a range of diseases…</p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand/20 bg-card p-7 space-y-4">
              <div className="inline-flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-brand/10 flex items-center justify-center">
                  <Brain className="h-3 w-3 text-brand" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-brand">After — AI Notes</span>
              </div>
              <div className="space-y-4">
                {[
                  { color: 'bg-marker-blue', textColor: 'text-marker-blue', label: 'Summary', content: 'Mitochondria are the energy producers of cells, converting ADP to ATP via oxidative phosphorylation.' },
                  { color: 'bg-marker-purple', textColor: 'text-marker-purple', label: 'Key Points', isList: true, items: ['Known as "powerhouse of the cell"', 'Converts ADP → ATP (energy currency)', 'Has its own DNA (maternally inherited)'] },
                  { color: 'bg-marker-green', textColor: 'text-marker-green', label: 'AI Explanation', content: 'Think of mitochondria like tiny batteries inside every cell that recharge themselves to keep the cell running.' },
                ].map((s) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div className={`w-1 rounded-full ${s.color} self-stretch shrink-0`} />
                    <div>
                      <div className={`text-[10px] font-semibold ${s.textColor} mb-1 uppercase tracking-widest`}>{s.label}</div>
                      {'isList' in s && s.isList ? (
                        <ul className="text-[13px] text-foreground leading-relaxed space-y-0.5 list-disc list-inside">
                          {s.items!.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-foreground leading-relaxed">{s.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-accent/20">
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-28 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-7">
            <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              Start Turning Documents<br />Into Smart Notes
            </motion.h2>
            <motion.div variants={fadeUp} custom={1}>
              <Button
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand-dark rounded-xl px-8 h-12 text-[14px] font-semibold shadow-lg shadow-brand/25"
                onClick={handleCTA}
              >
                Start Making Notes <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </motion.div>
            <motion.p variants={fadeUp} custom={2} className="text-[12px] text-muted-foreground tracking-wide">
              Free to try &nbsp;•&nbsp; No credit card required
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-[13px] text-muted-foreground font-medium">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/itsmohitkala"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <span className="text-[12px] text-muted-foreground">© {new Date().getFullYear()} NexNotes · Founded by <span className="text-foreground font-medium">Mohit Kala</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
