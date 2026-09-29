'use client';

import React from 'react';
import { Menu, Plus, MessageSquare, HelpCircle, History, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import {
  createNewChat,
  setActiveChatId,
  deleteChat,
  toggleSidebar,
  setSidebarOpen
} from '../lib/features/chat/chatSlice';
import ChatHistoryList from './SidebarHistory';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);
  const isSidebarOpen = useAppSelector((state) => state.chat.isSidebarOpen);

  const handleNewChat = () => {
    dispatch(createNewChat());
    // On mobile, auto close sidebar when creating new chat
    if (window.innerWidth <= 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleSelectChat = (id: string) => {
    dispatch(setActiveChatId(id));
    if (window.innerWidth <= 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(deleteChat(id));
  };

  return (
    <>
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } flex shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-[width] duration-300 ease-out max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 ${
          isSidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        }`}
      >
        {/* Header with toggle menu */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-3">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-elevated hover:text-ink"
            onClick={() => dispatch(toggleSidebar())}
            title={isSidebarOpen ? 'Collapse menu' : 'Expand menu'}
          >
            <Menu size={18} />
          </button>
          {isSidebarOpen ? (
            <span className="flex items-center gap-2 pr-1 text-sm font-semibold text-ink">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/15 text-accent">
                <MessageSquare size={14} />
              </span>
              DeepAgent
            </span>
          ) : null}
        </div>

        {/* New Chat Button */}
        <div className="px-3 pb-3">
          <button
            className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm font-medium text-ink transition hover:border-accent/50 hover:bg-canvas"
            onClick={handleNewChat}
          >
            <Plus size={16} className="text-accent" />
            <span className={isSidebarOpen ? '' : 'sr-only'}>New chat</span>
          </button>
        </div>

        {/* Recent Chats History */}
        <ChatHistoryList
          chats={chats}
          activeChatId={activeChatId}
          isSidebarOpen={isSidebarOpen}
          onSelect={handleSelectChat}
          onDelete={handleDeleteChat}
        />

        {/* Bottom Actions Navigation */}
        <div className="mt-2 border-t border-line p-2">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink" title="Help">
            <HelpCircle size={16} className="shrink-0" />
            <span className={isSidebarOpen ? '' : 'sr-only'}>Help</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink" title="Activity">
            <History size={16} className="shrink-0" />
            <span className={isSidebarOpen ? '' : 'sr-only'}>Activity</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink" title="Settings">
            <Settings size={16} className="shrink-0" />
            <span className={isSidebarOpen ? '' : 'sr-only'}>Settings</span>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile overlays */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => dispatch(setSidebarOpen(false))}
      />
    </>
  );
}
