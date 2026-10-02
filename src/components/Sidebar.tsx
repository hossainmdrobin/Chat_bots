'use client';

import React, { useEffect } from 'react';
import { Menu, Plus, MessageSquare, HelpCircle, History, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { useDeleteChatMutation, useGetChatsQuery } from '../lib/api/baseApi';
import { toggleSidebar, setSidebarOpen } from '../lib/features/chat/chatSlice';
import { rememberAccount } from '../lib/auth/remembered-account';
import ChatHistoryList from './SidebarHistory';
import AuthActionForm from './auth/AuthActionForm';

interface SidebarProps {
  userEmail: string;
  threadId: string | null;
}

export default function Sidebar({ userEmail, threadId }: SidebarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: chats = [], isLoading } = useGetChatsQuery();
  const [deleteChat, { isLoading: isDeleting }] = useDeleteChatMutation();
  const isSidebarOpen = useAppSelector((state) => state.chat.isSidebarOpen);

  useEffect(() => {
    rememberAccount(userEmail);
  }, [userEmail]);

  const handleNewChat = () => {
    router.push('/');
    if (window.innerWidth <= 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleSelectChat = (id: string) => {
    router.push(`/chat/${encodeURIComponent(id)}`);
    if (window.innerWidth <= 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteChat(id);
    if (threadId === id) {
      router.push('/');
    }
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
          activeChatId={threadId}
          isSidebarOpen={isSidebarOpen}
          isLoading={isLoading}
          isDeleting={isDeleting}
          onSelect={handleSelectChat}
          onDelete={handleDeleteChat}
        />

        {/* Signed-in account */}
        <div className="mt-auto border-t border-line p-2">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent uppercase">
              {userEmail.charAt(0)}
            </span>
            <span
              className={`truncate ${isSidebarOpen ? '' : 'sr-only'}`}
              title={userEmail}
            >
              {userEmail}
            </span>
          </div>
          <AuthActionForm
            action="signout"
            className="mt-1"
            buttonClassName="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2.5">
              <LogOut size={16} className="shrink-0" />
              <span className={isSidebarOpen ? '' : 'sr-only'}>Sign out</span>
            </span>
          </AuthActionForm>
        </div>

        {/* Bottom Actions Navigation */}
        <div className="border-t border-line p-2">
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
