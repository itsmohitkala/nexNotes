import { useState, useEffect } from 'react';
import { FileSearch, Brain, Sparkles, Check } from 'lucide-react';

const STEPS = [
  { label: 'Reading document', icon: FileSearch, delay: 0 },
  { label: 'Extracting knowledge', icon: Brain, delay: 3000 },
  { label: 'Generating notes', icon: Sparkles, delay: 6000 },
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
      <div className="flex flex-col items-center gap-6 max-w-sm w-full animate-fade-in">
        {/* Minimal spinner */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          <div className="absolute inset-0 rounded-full border-2 border-foreground/70 border-t-transparent animate-spin" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">Processing document</p>
          <p className="text-xs text-muted-foreground tabular-nums">{formatTime(elapsed)}</p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-300 ${
                  isActive
                    ? 'text-foreground'
                    : isDone
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/40'
                }`}
              >
                <div className="relative h-4 w-4 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isActive ? (
                    <>
                      <div className="absolute inset-0 rounded-full bg-foreground/10 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                    </>
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                  )}
                </div>
                <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
