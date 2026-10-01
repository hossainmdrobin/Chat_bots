'use client';

import { Bot, PanelLeft } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  isGenerating: boolean;
  onToggleSidebar: () => void;
}

function StatusDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

function StatusLabel({ isGenerating }: { isGenerating: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-muted">
      {isGenerating ? <StatusDot /> : <Bot size={13} />}
      {isGenerating ? 'DeepAgent is thinking' : 'Ready'}
    </span>
  );
}

export default function ChatHeader({ title, isGenerating, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-elevated hover:text-ink"
      >
        <PanelLeft size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-ink">{title}</h1>
        <p className="truncate text-xs text-muted">
          {isGenerating ? 'Generating a response' : 'Ask anything, or attach a file to get started'}
        </p>
      </div>

      <StatusLabel isGenerating={isGenerating} />
    </header>
  );
}
