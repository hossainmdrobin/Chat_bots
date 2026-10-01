'use client';

import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type { Chat } from '@/lib/features/chat/chatSlice';

interface ChatHistoryListProps {
  chats: Chat[];
  activeChatId: string | null;
  isSidebarOpen: boolean;
  onSelect: (id: string) => void;
  onDelete: (event: React.MouseEvent, id: string) => void;
}

export default function ChatHistoryList({
  chats,
  activeChatId,
  isSidebarOpen,
  onSelect,
  onDelete,
}: ChatHistoryListProps) {
  return (
    <div className="app-scrollbar flex-1 px-2">
      {isSidebarOpen && chats.length > 0 ? (
        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Recent
        </div>
      ) : null}

      {chats.map((chat) => {
        const isActive = chat.id === activeChatId;

        return (
          <div
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            title={chat.title}
            className={`group mb-0.5 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isActive ? 'bg-elevated text-ink' : 'text-muted hover:bg-elevated/60 hover:text-ink'
            }`}
          >
            <MessageSquare size={15} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">{chat.title}</span>
            <button
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted opacity-0 transition hover:bg-line hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
              onClick={(event) => onDelete(event, chat.id)}
              title="Delete conversation"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
