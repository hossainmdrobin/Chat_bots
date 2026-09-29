'use client';

import { Bot, Image as ImageIcon, Paperclip, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { title: 'Explain a concept', hint: 'Describe App Router caching in simple terms' },
  { title: 'Write & refine', hint: 'Draft a short product announcement' },
  { title: 'Analyse an image', hint: 'Attach a screenshot and ask questions' },
  { title: 'Plan a build', hint: 'Outline steps for a chat application' },
];

interface EmptyStateProps {
  onSelect: (value: string) => void;
}

function SuggestionCard({ title, hint, onClick }: { title: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-3.5 text-left transition hover:border-accent/50 hover:bg-elevated"
    >
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent transition group-hover:bg-accent/20">
        <Sparkles size={14} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block truncate text-xs text-muted">{hint}</span>
      </span>
    </button>
  );
}

export default function EmptyState({ onSelect }: EmptyStateProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-surface text-accent">
        <Bot size={24} />
      </div>
      <h2 className="text-xl font-semibold text-ink sm:text-2xl">What can I help you with?</h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        Start a conversation below. You can attach photos or documents to give the assistant more context.
      </p>

      <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((item) => (
          <SuggestionCard
            key={item.title}
            title={item.title}
            hint={item.hint}
            onClick={() => onSelect(item.hint)}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1">
          <ImageIcon size={12} /> Image upload
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1">
          <Paperclip size={12} /> File upload
        </span>
      </div>
    </div>
  );
}
