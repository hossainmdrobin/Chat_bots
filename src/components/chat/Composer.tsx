'use client';

import { useRef } from 'react';
import type { ChangeEvent, DragEvent, FormEvent, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import AttachmentTray from './AttachmentTray';
import ComposerHint from './ComposerHint';
import type { Attachment } from './AttachmentChip';
import { FilePicker } from './FilePicker';

const MAX_TEXTAREA_HEIGHT = 200;

interface ComposerProps {
  value: string;
  isLoading: boolean;
  attachments: Attachment[];
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAddFiles: (files: FileList | null) => void;
  onRemoveAttachment: (id: string) => void;
}

export default function Composer({
  value,
  isLoading,
  attachments,
  onChange,
  onSubmit,
  onAddFiles,
  onRemoveAttachment,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = (target: HTMLTextAreaElement | null) => {
    if (!target) return;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
    resize(event.target);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddFiles(event.dataTransfer.files);
  };

  const canSend = value.trim().length > 0;

  return (
    <form
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit();
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="shrink-0 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-4 pb-4 pt-2 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto w-full max-w-3xl">
        <AttachmentTray attachments={attachments} onRemove={onRemoveAttachment} />

        <div className="flex items-end gap-1.5 rounded-2xl border border-line bg-surface p-2 shadow-lg shadow-black/20 transition focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20">
          <FilePicker onFiles={onAddFiles} />

          <textarea
            ref={textareaRef}
            name="chatarea"
            id="chatarea"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Send a message, or drop a file here…"
            className="app-scrollbar max-h-[200px] min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-ink outline-none placeholder:text-muted"
          />

          {isLoading ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-elevated text-muted">
              <Square size={14} className="fill-current" />
            </span>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted"
            >
              <Send size={15} />
            </button>
          )}
        </div>

        <ComposerHint isLoading={isLoading} />
      </div>
    </form>
  );
}
