'use client';

import { Bot } from 'lucide-react';

const DOTS = [0, 1, 2];

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
        <Bot size={16} />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3">
        {DOTS.map((index) => (
          <span
            key={index}
            style={{ animationDelay: `${index * 0.15}s` }}
            className="h-1.5 w-1.5 animate-blink rounded-full bg-muted"
          />
        ))}
      </div>
      <span className="text-xs text-muted">DeepAgent is thinking…</span>
    </div>
  );
}
