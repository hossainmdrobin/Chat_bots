'use client';

import type { RefObject } from 'react';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  prompt: string;
  text: string;
  isLoading: boolean;
  onSelectSuggestion: (value: string) => void;
}

export default function MessageList({
  scrollRef,
  prompt,
  text,
  isLoading,
  onSelectSuggestion,
}: MessageListProps) {
  const hasConversation = Boolean(prompt || text);

  return (
    <div ref={scrollRef} className="app-scrollbar relative flex-1">
      {!hasConversation ? (
        <EmptyState onSelect={onSelectSuggestion} />
      ) : (
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          {prompt ? <MessageBubble role="user" content={prompt} /> : null}
          {text ? <MessageBubble role="model" content={text} isStreaming={isLoading} /> : null}
          {isLoading && !text ? <TypingIndicator /> : null}
        </div>
      )}
    </div>
  );
}
