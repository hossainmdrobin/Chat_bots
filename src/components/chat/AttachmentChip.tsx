'use client';

import { FileText, Image as ImageIcon, X } from 'lucide-react';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

const IMAGE_TYPES = ['image/', 'image'];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

export default function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const isImage = IMAGE_TYPES.some((type) => attachment.type.startsWith(type));

  return (
    <div className="group flex w-44 items-center gap-2.5 rounded-xl border border-line bg-elevated p-2">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          isImage ? 'bg-accent/15 text-accent' : 'bg-canvas text-muted'
        }`}
      >
        {isImage ? <ImageIcon size={15} /> : <FileText size={15} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-ink" title={attachment.name}>
          {attachment.name}
        </span>
        <span className="block text-[11px] text-muted">{formatSize(attachment.size)}</span>
      </span>
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        aria-label={`Remove ${attachment.name}`}
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted opacity-0 transition hover:bg-line hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  );
}
