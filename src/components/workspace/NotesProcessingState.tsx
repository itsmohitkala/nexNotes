import { useState, useEffect } from 'react';
import { FileSearch, Brain, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { label: 'Reading document...', icon: FileSearch, delay: 0 },
  { label: 'Extracting knowledge...', icon: Brain, delay: 3000 },
  { label: 'Generating structured notes...', icon: Sparkles, delay: 6000 },
];

export const NotesProcessingState = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((step, i) => {
      if (i === 0) return null;
      return setTimeout(() => setActiveStep(i), step.delay);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px] p-8">
      <div className="flex flex-col items-center gap-8 max-w-md w-full animate-fade-in">
        {/* Animated orb */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full bg-primary/5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute h-16 w-16 rounded-full bg-primary/10 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
          <div className="relative h-12 w-12 rounded-full bg-primary/20 shadow-[0_0_30px_6px_hsl(var(--primary)/0.2)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-section-title text-foreground">Processing your document</h2>
          <p className="text-caption text-muted-foreground">This may take a moment</p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-500 ${
                  isActive
                    ? 'bg-primary/10 border border-primary/20'
                    : isDone
                    ? 'bg-muted/50 border border-transparent'
                    : 'bg-transparent border border-transparent opacity-40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                )}
                <span className={`text-sm ${isActive ? 'text-foreground font-medium' : isDone ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
