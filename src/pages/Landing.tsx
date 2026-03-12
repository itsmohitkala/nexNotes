import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  FileText,
  MessageSquare,
  Zap,
  GraduationCap,
  BookOpen,
  Briefcase,
  ArrowRight,
  Highlighter,
  Brain,
  Github,
  NotebookPen,
  Users,
  BotMessageSquare,
  Bot,
  Copy,
  Send,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function AnimatedCounter({
  target,
  suffix = "+",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) return `${(v / 1000).toFixed(v >= target ? 0 : 1)}K`;
    return Math.round(v).toString();
  });

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2, ease: "easeOut" });
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

const SectionHeading = ({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) => (
  <div className="text-center mb-16 space-y-4">
    <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
      {children}
    </h2>
    {subtitle && (
      <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

const Landing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    notes_count: 0,
    users_count: 0,
    ai_queries_count: 0,
  });

  useEffect(() => {
    supabase.rpc("get_public_stats").then(({ data }) => {
      if (data) setStats(data as typeof stats);
    });
  }, []);

  const handleCTA = () => navigate(user ? "/workspace" : "/signup");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-b-[rgba(255,255,255,0.06)]">
        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10 h-16">
          {/* Left: Brand */}
          <Link to="/" className="flex items-center gap-2.5 justify-self-start">
            <img
              src="/logo.png"
              alt="NexNotes"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-base font-bold text-foreground tracking-tight">
              NexNotes
            </span>
          </Link>

          {/* Center: Nav links — always truly centered */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="hover:text-foreground transition-colors"
            >
              Use Cases
            </a>
          </nav>

          {/* Right: Utility + Auth actions */}
          <div className="flex items-center justify-end gap-1">
            <a
              href="https://github.com/itsmohitkala"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="GitHub"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
            <ThemeToggle />
            <div className="w-px h-5 bg-border mx-2" />
            {user ? (
              <>
                <Link to="/workspace">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Workspace
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Log out
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className="text-sm bg-brand text-brand-foreground hover:bg-brand-dark rounded-lg font-medium h-9 px-5 ml-1"
                >
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid md:grid-cols-2 gap-20 lg:gap-28 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.h1
                variants={fadeUp}
                custom={0}
                className="text-5xl md:text-[3.75rem] font-bold tracking-tight text-foreground leading-[1.08]"
              >
                Turn Documents
                <br />
                Into Interactive AI Notes
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-[460px]"
              >
                Upload PDFs, highlight any text, and instantly explain,
                simplify, or ask questions. NexNotes helps you understand
                information faster.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={2}
                className="flex items-center gap-3 pt-1"
              >
                <Button
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand-dark rounded-xl px-8 h-11 text-base font-semibold shadow-lg shadow-brand/25"
                  onClick={handleCTA}
                >
                  Start Making Notes <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 h-11 text-base font-semibold border-border text-foreground hover:bg-accent"
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See Demo
                </Button>
              </motion.div>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-sm text-muted-foreground tracking-wide"
              >
                No setup required &nbsp;•&nbsp; Works with PDFs, articles, and
                text
              </motion.p>
            </motion.div>

            {/* Product Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
            >
              <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-brand/5 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-accent/40">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-marker-orange/50" />
                  <div className="w-3 h-3 rounded-full bg-marker-green/50" />
                  <span className="ml-3 text-[11px] text-muted-foreground font-medium tracking-wide">
                    NexNotes
                  </span>
                </div>
                <div className="flex min-h-[320px]">
                  {/* Sidebar */}
                  <div className="w-[100px] border-r border-border p-3.5 space-y-2.5 bg-accent/20 shrink-0">
                    <div className="text-[11px] font-semibold text-foreground mb-3 tracking-wide">
                      Your Notes
                    </div>
                    {["Research Paper", "Biology Ch.4", "Meeting Notes"].map(
                      (t, i) => (
                        <div
                          key={t}
                          className={`text-[11px] px-2.5 py-2 rounded-lg truncate ${i === 0 ? "bg-brand/10 text-brand border border-brand/20 font-medium" : "text-muted-foreground"}`}
                        >
                          {t}
                        </div>
                      ),
                    )}
                  </div>
                  {/* Notes Content */}
                  <div className="flex-1 p-4 space-y-3.5 border-r border-border">
                    <div className="text-[11px] font-semibold text-foreground tracking-wide">
                      AI-Generated Notes
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          color: "bg-marker-blue",
                          textColor: "text-marker-blue",
                          label: "Summary",
                          w1: "w-full",
                          w2: "w-4/5",
                        },
                        {
                          color: "bg-marker-purple",
                          textColor: "text-marker-purple",
                          label: "Key Points",
                          w1: "w-full",
                          w2: "w-3/5",
                        },
                        {
                          color: "bg-marker-green",
                          textColor: "text-marker-green",
                          label: "Concepts",
                          w1: "w-full",
                          w2: "w-2/3",
                        },
                      ].map((s) => (
                        <div key={s.label} className="flex items-start gap-2.5">
                          <div
                            className={`w-1 rounded-full ${s.color} self-stretch shrink-0`}
                          />
                          <div className="space-y-1.5 flex-1">
                            <div
                              className={`text-[10px] font-semibold ${s.textColor} uppercase tracking-widest`}
                            >
                              {s.label}
                            </div>
                            <div
                              className={`h-2 ${s.w1} rounded-full bg-muted`}
                            />
                            <div
                              className={`h-2 ${s.w2} rounded-full bg-muted`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="text-[9px] px-2.5 py-1 rounded bg-brand/10 text-brand font-semibold">
                        Explain
                      </div>
                      <div className="text-[9px] px-2.5 py-1 rounded bg-accent text-muted-foreground font-medium">
                        Simplify
                      </div>
                      <div className="text-[9px] px-2.5 py-1 rounded bg-accent text-muted-foreground font-medium">
                        Ask AI
                      </div>
                    </div>
                  </div>
                  {/* AI Assistant Panel */}
                  <div className="w-[150px] shrink-0 flex flex-col bg-background border-l border-border">
                    <div className="px-3 py-3 border-b border-border flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground">
                        AI Assistant
                      </span>
                    </div>
                    <div className="flex-1 px-3 py-3.5 space-y-3 overflow-hidden">
                      <div className="rounded-xl bg-accent px-3 py-2.5 space-y-1.5">
                        <div className="h-2 w-full rounded-full bg-muted" />
                        <div className="h-2 w-3/5 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-2 px-0.5">
                        <div className="h-2 w-full rounded-full bg-muted" />
                        <div className="h-2 w-full rounded-full bg-muted" />
                        <div className="h-2 w-4/5 rounded-full bg-muted" />
                        <div className="flex items-center gap-1 text-[8px] text-muted-foreground pt-0.5">
                          <Copy className="h-2.5 w-2.5" /> Copy
                        </div>
                      </div>
                      <div className="rounded-xl bg-accent px-3 py-2.5 space-y-1.5">
                        <div className="h-2 w-full rounded-full bg-muted" />
                        <div className="h-2 w-2/5 rounded-full bg-muted" />
                      </div>
                      <div className="flex items-center gap-2 px-0.5">
                        <div className="h-3 w-3 rounded-full border border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                        <span className="text-[9px] text-muted-foreground">
                          Thinking...
                        </span>
                      </div>
                    </div>
                    <div className="px-2.5 pb-3 pt-2 border-t border-border">
                      <div className="flex items-center gap-2 bg-card rounded-xl border border-border px-3 py-2">
                        <span className="text-[8px] text-muted-foreground flex-1">
                          Ask a question...
                        </span>
                        <Send className="h-3 w-3 text-muted-foreground/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-5 tracking-wide">
                Study faster with AI-powered notes that understand your
                documents.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="border-t border-border bg-accent/20"
      >
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <SectionHeading>See How It Works</SectionHeading>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-7">
            {[
              {
                step: "1",
                title: "Upload Your Document",
                desc: "PDF, article link, or text.",
                icon: FileText,
              },
              {
                step: "2",
                title: "AI Builds Your Notes",
                desc: "Extracts key ideas and organizes them into structured notes.",
                icon: Brain,
              },
              {
                step: "3",
                title: "Interact with Your Notes",
                desc: "Highlight to explain, simplify, summarize, or ask questions.",
                icon: Highlighter,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-card p-8 text-center flex flex-col items-center"
              >
                <div className="h-12 w-12 rounded-full bg-brand text-brand-foreground text-base font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground mt-5">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mt-2.5 min-h-[44px]">
                  {item.desc}
                </p>
                <div className="w-full mt-auto pt-6">
                  <div className="rounded-xl bg-accent/50 border border-border flex items-center justify-center h-28">
                    <item.icon className="h-10 w-10 text-brand/50" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <SectionHeading>Smart Features</SectionHeading>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: "AI Note Generation",
                desc: "Convert long documents into structured notes instantly.",
              },
              {
                icon: Highlighter,
                title: "Highlight & Simplify",
                desc: "Explain concepts & simplify text with a single highlight.",
              },
              {
                icon: MessageSquare,
                title: "Ask Questions",
                desc: "Get contextual answers from your document.",
              },
              {
                icon: Zap,
                title: "Quick Summaries",
                desc: "Summarize key points in seconds.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-card p-7 text-center space-y-4 hover:border-brand/30 hover:shadow-sm transition-all duration-200 flex flex-col items-center"
              >
                <div className="h-14 w-14 rounded-xl bg-brand/10 flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section id="use-cases" className="border-t border-border bg-accent/20">
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <SectionHeading>Perfect For</SectionHeading>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-7">
            {[
              {
                icon: GraduationCap,
                title: "Students",
                desc: "Turn textbooks and PDFs into study notes.",
              },
              {
                icon: BookOpen,
                title: "Researchers",
                desc: "Extract key insights from research papers.",
              },
              {
                icon: Briefcase,
                title: "Professionals",
                desc: "Understand reports and documentation faster.",
              },
            ].map((u, i) => (
              <motion.div
                key={u.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-card p-9 text-center space-y-5 flex flex-col items-center"
              >
                <div className="h-[72px] w-[72px] rounded-2xl bg-brand/10 flex items-center justify-center">
                  <u.icon className="h-8 w-8 text-brand" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {u.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {u.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Counter ── */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <SectionHeading subtitle="Growing every day with users who love smarter notes.">
              By the Numbers
            </SectionHeading>
          </motion.div>
          <div className="grid grid-cols-3 gap-7">
            {[
              {
                icon: NotebookPen,
                value: stats.notes_count + 100,
                label: "Notes Created",
              },
              {
                icon: Users,
                value: stats.users_count + 100,
                label: "Happy Users",
              },
              {
                icon: BotMessageSquare,
                value: stats.ai_queries_count + 100,
                label: "AI Queries",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-card p-9 text-center space-y-4 flex flex-col items-center hover:border-brand/30 transition-colors duration-200"
              >
                <div className="h-14 w-14 rounded-xl bg-brand/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-brand" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                  <AnimatedCounter target={stat.value} />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before & After ── */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <SectionHeading subtitle="See how NexNotes transforms a dense document into organized, actionable notes.">
              Before &amp; After
            </SectionHeading>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="grid md:grid-cols-2 gap-7"
          >
            <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
              <div className="inline-flex items-center gap-2.5">
                <div className="h-6 w-6 rounded bg-destructive/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-destructive/70" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-destructive/70">
                  Before
                </span>
              </div>
              <div className="text-sm text-muted-foreground leading-[1.8] space-y-3">
                <p>
                  The mitochondria, often referred to as the powerhouse of the
                  cell, play a critical role in cellular respiration. Through
                  the process of oxidative phosphorylation, they convert ADP
                  into ATP, which serves as the primary energy currency for
                  cellular functions…
                </p>
                <p>
                  Additionally, mitochondria are involved in the regulation of
                  metabolic pathways and have their own DNA, which is maternally
                  inherited. Dysfunction in mitochondrial processes has been
                  linked to a range of diseases…
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand/20 bg-card p-8 space-y-5">
              <div className="inline-flex items-center gap-2.5">
                <div className="h-6 w-6 rounded bg-brand/10 flex items-center justify-center">
                  <Brain className="h-3.5 w-3.5 text-brand" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                  After — AI Notes
                </span>
              </div>
              <div className="space-y-5">
                {[
                  {
                    color: "bg-marker-blue",
                    textColor: "text-marker-blue",
                    label: "Summary",
                    content:
                      "Mitochondria are the energy producers of cells, converting ADP to ATP via oxidative phosphorylation.",
                  },
                  {
                    color: "bg-marker-purple",
                    textColor: "text-marker-purple",
                    label: "Key Points",
                    isList: true,
                    items: [
                      'Known as "powerhouse of the cell"',
                      "Converts ADP → ATP (energy currency)",
                      "Has its own DNA (maternally inherited)",
                    ],
                  },
                  {
                    color: "bg-marker-green",
                    textColor: "text-marker-green",
                    label: "AI Explanation",
                    content:
                      "Think of mitochondria like tiny batteries inside every cell that recharge themselves to keep the cell running.",
                  },
                ].map((s) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div
                      className={`w-1 rounded-full ${s.color} self-stretch shrink-0`}
                    />
                    <div>
                      <div
                        className={`text-[11px] font-semibold ${s.textColor} mb-1.5 uppercase tracking-widest`}
                      >
                        {s.label}
                      </div>
                      {"isList" in s && s.isList ? (
                        <ul className="text-sm text-foreground leading-relaxed space-y-1 list-disc list-inside">
                          {s.items!.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-foreground leading-relaxed">
                          {s.content}
                        </p>
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
        <div className="max-w-3xl mx-auto px-6 py-28 md:py-32 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight"
            >
              Start Turning Documents
              <br />
              Into Smart Notes
            </motion.h2>
            <motion.div variants={fadeUp} custom={1}>
              <Button
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand-dark rounded-xl px-9 h-11 text-base font-semibold shadow-lg shadow-brand/25"
                onClick={handleCTA}
              >
                Start Making Notes <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-sm text-muted-foreground tracking-wide"
            >
              Free to try &nbsp;•&nbsp; No credit card required
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-foreground transition-colors">
              About
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/itsmohitkala"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="GitHub"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NexNotes · Founded by{" "}
              <span className="text-foreground font-medium">Mohit Kala</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
