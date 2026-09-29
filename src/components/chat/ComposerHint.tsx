'use client';

import { LoaderCircle } from 'lucide-react';

export default function ComposerHint({ isLoading }: { isLoading: boolean }) {
  return (
    <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted">
      {isLoading ? (
        <>
          <LoaderCircle size={11} className="animate-spin" />
          Streaming response…
        </>
      ) : (
        'Enter to send · Shift + Enter for a new line'
      )}
    </p>
  );
}
