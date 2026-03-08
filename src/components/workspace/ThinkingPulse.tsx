import { useState, useEffect } from 'react';

const MESSAGES = [
  'Reading document…',
  'Extracting key ideas…',
  'Building your notes…',
];

export const ThinkingPulse = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Glowing orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <div className="absolute h-28 w-28 rounded-full bg-accent/5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        {/* Mid pulse ring */}
        <div className="absolute h-20 w-20 rounded-full bg-accent/10 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
        {/* Inner glow */}
        <div className="relative h-14 w-14 rounded-full bg-accent/20 shadow-[0_0_40px_8px_hsl(var(--accent)/0.25)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          <div className="absolute inset-1 rounded-full bg-accent/30 blur-sm" />
          <div className="absolute inset-3 rounded-full bg-accent/50" />
        </div>
      </div>

      {/* Cycling text */}
      <p
        className={`text-sm text-muted-foreground font-mono tracking-wide transition-opacity duration-300 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {MESSAGES[index]}
      </p>
    </div>
  );
};
