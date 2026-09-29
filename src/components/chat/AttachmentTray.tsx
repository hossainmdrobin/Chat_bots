'use client';

import AttachmentChip from './AttachmentChip';
import type { Attachment } from './AttachmentChip';

interface AttachmentTrayProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export default function AttachmentTray({ attachments, onRemove }: AttachmentTrayProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <AttachmentChip key={attachment.id} attachment={attachment} onRemove={onRemove} />
      ))}
    </div>
  );
}
