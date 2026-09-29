'use client';

import { Bot, User } from 'lucide-react';
import AssistantMarkdown from './AssistantMarkdown';

interface MessageBubbleProps {
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
}

function Avatar({ role }: { role: MessageBubbleProps['role'] }) {
  const isUser = role === 'user';

  return (
    <div
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
        isUser ? 'bg-elevated text-ink' : 'bg-accent/15 text-accent'
      }`}
      aria-hidden="true"
    >
      {isUser ? <User size={15} /> : <Bot size={16} />}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end gap-3 pl-10 sm:pl-16">
      <div className="max-w-[85%] rounded-2xl rounded-br-md border border-line bg-elevated px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-ink sm:max-w-[75%]">
        {content}
      </div>
      <Avatar role="user" />
    </div>
  );
}

function ModelBubble({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  return (
    <div className="flex gap-3 pr-6 sm:pr-16">
      <Avatar role="model" />
      <div className="min-w-0 flex-1 pt-1">
        {content ? (
          <div className={isStreaming ? 'animate-fade-up' : undefined}>
            <AssistantMarkdown content={content} />
          </div>
        ) : null}
        {isStreaming ? (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
            <span className="animate-blink">▍</span>
            streaming
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  return (
    <div className="animate-fade-up">
      {role === 'user' ? <UserBubble content={content} /> : <ModelBubble content={content} isStreaming={isStreaming} />}
    </div>
  );
}
