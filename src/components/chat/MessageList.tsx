'use client';

import type { RefObject } from 'react';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export interface ChatMessageView {
  role: 'user' | 'model';
  content: string;
}

interface MessageListProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  messages: ChatMessageView[];
  prompt: string;
  text: string;
  isLoading: boolean;
  isFetchingHistory?: boolean;
  onSelectSuggestion: (value: string) => void;
}

export default function MessageList({
  scrollRef,
  messages,
  prompt,
  text,
  isLoading,
  isFetchingHistory = false,
  onSelectSuggestion,
}: MessageListProps) {
  const hasConversation = messages.length > 0 || Boolean(prompt || text);

  return (
    <div ref={scrollRef} className="app-scrollbar relative flex-1">
      {!hasConversation ? (
        isFetchingHistory ? null : <EmptyState onSelect={onSelectSuggestion} />
      ) : (
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          {messages.map((message, index) => (
            <MessageBubble
              key={`${index}-${message.content.slice(0, 16)}`}
              role={message.role}
              content={message.content}
            />
          ))}
          {prompt ? <MessageBubble role="user" content={prompt} /> : null}
          {text ? <MessageBubble role="model" content={text} isStreaming={isLoading} /> : null}
          {isLoading && !text ? <TypingIndicator /> : null}
        </div>
      )}
    </div>
  );
}