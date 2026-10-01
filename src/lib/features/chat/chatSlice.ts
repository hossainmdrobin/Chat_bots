import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isPending?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isSidebarOpen: boolean;
  isGenerating: boolean; // Thinking or typing
}

const getInitialChats = (): Chat[] => {
  return [
    {
      id: 'default-chat-1',
      title: 'Welcome to DeepAgent',
      createdAt: new Date().toLocaleDateString(),
      messages: [
        {
          id: 'm1',
          role: 'model',
          content: 'Hello! I\'m DeepAgent, your AI assistant. I can help you write, plan, learn, and much more. What\'s on your mind today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    },
    {
      id: 'default-chat-2',
      title: 'Next.js App Router Tips',
      createdAt: new Date().toLocaleDateString(),
      messages: [
        {
          id: 'm2',
          role: 'user',
          content: 'What are the main benefits of Next.js App Router?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'm3',
          role: 'model',
          content: 'The Next.js App Router introduces several key features:\n\n1. **React Server Components (RSC)**: Load components on the server by default to reduce client-side bundle size.\n2. **Nested Routes & Layouts**: Easily share UI across pages (headers, sidebars) without full re-renders.\n3. **Simplified Data Fetching**: Fetch data directly inside Server Components using standard async/await.\n4. **Streaming and Suspense**: Stream UI slices from server to client instantly as they become ready, improving UX.\n5. **Built-in Optimizations**: Enhanced handling of images, fonts, and scripts out of the box.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
  ];
};

const initialState: ChatState = {
  chats: getInitialChats(),
  activeChatId: 'default-chat-1',
  isSidebarOpen: true,
  isGenerating: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        // Remove pending message if it exists
        chat.messages = chat.messages.filter((m) => !m.isPending);
        chat.messages.push(message);
        
        // Auto-update title if it's the first real question and title is "New Chat" or similar
        if (chat.title === 'New Chat' || chat.title.startsWith('Conversation on')) {
          const firstUserMsg = chat.messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            chat.title = firstUserMsg.content.length > 28 
              ? firstUserMsg.content.substring(0, 25) + '...' 
              : firstUserMsg.content;
          }
        }
      }
    },
    addPendingMessage: (state, action: PayloadAction<{ chatId: string; messageId?: string }>) => {
      const { chatId, messageId } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.messages.push({
          id: messageId ?? `pending-${Date.now()}`,
          role: 'model',
          content: '',
          timestamp: '',
          isPending: true
        });
      }
    },
    updateMessageContent: (state, action: PayloadAction<{ chatId: string; messageId: string; content: string }>) => {
      const { chatId, messageId, content } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        const msg = chat.messages.find((m) => m.id === messageId);
        if (msg) {
          msg.content = content;
          msg.isPending = content.length === 0;
        }
      }
    },
    createNewChat: (state, action: PayloadAction<string | undefined>) => {
      const promptText = action.payload;
      const id = `chat-${Date.now()}`;
      const title = promptText
        ? (promptText.length > 28 ? promptText.substring(0, 25) + '...' : promptText)
        : 'New Chat';
      
      const newChat: Chat = {
        id,
        title,
        createdAt: new Date().toLocaleDateString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'model',
          content: 'Hello! I\'m DeepAgent, your AI assistant. I can help you write, plan, learn, and much more. What\'s on your mind today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      
      state.chats.unshift(newChat); // Put new chat at the top
      state.activeChatId = id;
    },
    setActiveChatId: (state, action: PayloadAction<string>) => {
      state.activeChatId = action.payload;
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      state.chats = state.chats.filter((c) => c.id !== chatId);
      if (state.activeChatId === chatId) {
        state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
      }
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    }
  },
});

export const {
  addMessage,
  addPendingMessage,
  updateMessageContent,
  createNewChat,
  setActiveChatId,
  deleteChat,
  toggleSidebar,
  setSidebarOpen,
  setIsGenerating
} = chatSlice.actions;

export default chatSlice.reducer;
