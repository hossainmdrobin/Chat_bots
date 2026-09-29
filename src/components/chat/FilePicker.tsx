'use client';

import { useRef } from 'react';
import { Image as ImageIcon, Paperclip } from 'lucide-react';

interface AttachMenuProps {
  onSelect: (kind: 'file' | 'image') => void;
}

export function AttachButton({ onSelect }: AttachMenuProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect('file')}
      title="Attach a file"
      aria-label="Attach a file"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-elevated hover:text-ink"
    >
      <Paperclip size={17} />
    </button>
  );
}

export function ImageButton({ onSelect }: AttachMenuProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect('image')}
      title="Attach a photo"
      aria-label="Attach a photo"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-elevated hover:text-ink"
    >
      <ImageIcon size={17} />
    </button>
  );
}

/**
 * Hidden native file input. Kept out of the visual tree so the chip UI
 * stays in charge of how selection is presented.
 */
export function FilePicker({ onFiles }: { onFiles: (files: FileList | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const open = (accept: string) => {
    const input = inputRef.current;
    if (!input) return;
    input.accept = accept;
    input.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <AttachButton onSelect={() => open('*/*')} />
      <ImageButton onSelect={() => open('image/*')} />
    </>
  );
}
