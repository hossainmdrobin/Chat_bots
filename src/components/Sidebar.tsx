'use client';

import React from 'react';
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Trash2, 
  HelpCircle, 
  History, 
  Settings 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { 
  createNewChat, 
  setActiveChatId, 
  deleteChat, 
  toggleSidebar, 
  setSidebarOpen 
} from '../lib/features/chat/chatSlice';

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
      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'} ${isSidebarOpen ? 'open' : ''}`}>
        {/* Header with toggle menu */}
        <div className="sidebar-header">
          <button 
            className="menu-toggle" 
            onClick={() => dispatch(toggleSidebar())}
            title={isSidebarOpen ? 'Collapse menu' : 'Expand menu'}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="new-chat-container">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <Plus size={20} className="new-chat-icon" />
            <span className="new-chat-text">New chat</span>
          </button>
        </div>

        {/* Recent Chats History */}
        <div className="recent-container">
          {isSidebarOpen && chats.length > 0 && (
            <div className="recent-title">Recent</div>
          )}
          
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-history-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => handleSelectChat(chat.id)}
              title={chat.title}
            >
              <div className="history-item-left">
                <MessageSquare size={16} />
                <span className="history-item-title">{chat.title}</span>
              </div>
              
              <button
                className="delete-chat-btn"
                onClick={(e) => handleDeleteChat(e, chat.id)}
                title="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Actions Navigation */}
        <div className="sidebar-bottom">
          <div className="nav-item" title="Help">
            <HelpCircle size={18} />
            <span className="nav-item-text">Help</span>
          </div>
          
          <div className="nav-item" title="Activity">
            <History size={18} />
            <span className="nav-item-text">Activity</span>
          </div>
          
          <div className="nav-item" title="Settings">
            <Settings size={18} />
            <span className="nav-item-text">Settings</span>
          </div>
        </div>
      </aside>
      
      {/* Backdrop for mobile overlays */}
      <div 
        className="sidebar-backdrop" 
        onClick={() => dispatch(setSidebarOpen(false))} 
      />
    </>
  );
}
