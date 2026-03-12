import { useState, useEffect } from 'react';
import { FileSearch, Brain, Sparkles, LayoutList, Check } from 'lucide-react';

const STEPS = [
  { label: 'Reading document', icon: FileSearch, delay: 0 },
  { label: 'Extracting key ideas', icon: Brain, delay: 5000 },
  { label: 'Structuring your notes', icon: LayoutList, delay: 12000 },
  { label: 'Finalizing your workspace', icon: Sparkles, delay: 20000 },
];

export const NotesProcessingState = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((step, i) => {
      if (i === 0) return null;
      return setTimeout(() => setActiveStep(i), step.delay);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px] p-8">
      <div className="flex flex-col items-center gap-8 max-w-xs w-full">

        {/* Glow spinner */}
        <div className="relative h-14 w-14 flex items-center justify-center">
          {/* Outer glow pulse */}
          <div
            className="absolute inset-[-6px] rounded-full bg-foreground/5 animate-pulse"
            style={{ animationDuration: '2.5s' }}
          />
          {/* Static track */}
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-foreground/70 border-t-transparent animate-spin" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">Generating your notes...</p>
          <p className="text-xs text-muted-foreground tabular-nums">{formatTime(elapsed)}</p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-0.5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-500 ${
                  isActive
                    ? 'text-foreground bg-accent/40'
                    : isDone
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/30'
                }`}
              >
                {/* Status indicator */}
                <div className="relative h-4 w-4 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isActive ? (
                    <>
                      <div
                        className="absolute inset-0 rounded-full bg-foreground/15 animate-ping"
                        style={{ animationDuration: '1.8s' }}
                      />
                      <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                    </>
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </div>

                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? 'text-foreground' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/30'
                  }`}
                />

                <span className={`text-[13px] ${isActive ? 'font-medium' : ''}`}>
                  {step.label}
                  {isActive && <span className="animate-pulse">...</span>}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[12px] text-muted-foreground/50 text-center">
          This usually takes 30–60 seconds
        </p>
      </div>
    </div>
  );
};
