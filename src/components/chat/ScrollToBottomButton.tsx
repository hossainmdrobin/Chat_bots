'use client';

import { ArrowDown, LoaderCircle } from 'lucide-react';

interface ScrollToBottomButtonProps {
  visible: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export default function ScrollToBottomButton({ visible, isLoading, onClick }: ScrollToBottomButtonProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Scroll to latest message"
        className="pointer-events-auto -translate-y-4 flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-2 text-xs font-medium text-muted shadow-lg shadow-black/30 backdrop-blur transition hover:bg-elevated hover:text-ink"
      >
        {isLoading ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowDown size={14} />}
        {isLoading ? 'Generating' : 'Latest message'}
      </button>
    </div>
  );
}
