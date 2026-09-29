'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowUp, 
  Mic, 
  Image as ImageIcon, 
  ChevronDown, 
  Share, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  RefreshCw, 
  Menu,
  Lightbulb,
  Code,
  Compass,
  PenTool
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { 
  addMessage, 
  addPendingMessage, 
  updateMessageContent,
  setIsGenerating,
  toggleSidebar,
  createNewChat
} from '../lib/features/chat/chatSlice';

// Markdown-like formatter for replies
function formatMessage(text: string) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks with language: ```js ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><div class="code-header">${lang || 'code'}</div><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Bullet items
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');

  // Numbered list items
  html = html.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>');

  // Wrap list items in ul/ol if they exist
  // Replace sequential <li> tags with <ul><li>...</li></ul>
  html = html.replace(/(<li>[\s\S]*<\/li>)/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Convert double list wraps
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Convert newlines to <br/> in non-pre elements
  const parts = html.split(/(<pre>[\s\S]*?<\/pre>)/g);
  html = parts.map(part => {
    if (part.startsWith('<pre>')) {
      return part;
    }
    return part.replace(/\n/g, '<br/>');
  }).join('');

  return html;
}

// Typewriter animation component
const Typewriter = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    
    // Quick typing speed: 8ms per character
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 6);

    return () => clearInterval(interval);
  }, [text]);

  const formattedHtml = formatMessage(displayedText);
  return <div className="message-content" dangerouslySetInnerHTML={{ __html: formattedHtml }} />;
};

export default function ChatWindow() {
  const dispatch = useAppDispatch();
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);
  const chats = useAppSelector((state) => state.chat.chats);
  const isGenerating = useAppSelector((state) => state.chat.isGenerating);
  
  const [inputVal, setInputVal] = useState('');
  const [typedMessageIds, setTypedMessageIds] = useState<Record<string, boolean>>({});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages?.length, isGenerating]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight - 16, 200)}px`;
    }
  }, [inputVal]);

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    dispatch(setIsGenerating(true));
    let targetChatId = activeChatId;

    if (!targetChatId) {
      const newId = `chat-${Date.now()}`;
      dispatch(createNewChat(trimmed));
      targetChatId = newId;
    }

    dispatch(
      addMessage({
        chatId: targetChatId,
        message: {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      })
    );

    dispatch(addPendingMessage({ chatId: targetChatId }));
    setInputVal('');

    const activeChat = chats.find((c) => c.id === targetChatId);
    const allMessages = activeChat
      ? activeChat.messages.map((m) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content,
        }))
      : [];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      const pendingMsg = activeChat?.messages.find((m) => m.isPending);
      const pendingId = pendingMsg?.id;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || line === '[DONE]') continue;
          if (!line.startsWith('0:"')) continue;

          try {
            const token = JSON.parse(line.slice(0, -1));
            fullContent += token;
            if (pendingId && targetChatId) {
              dispatch(
                updateMessageContent({
                  chatId: targetChatId,
                  messageId: pendingId,
                  content: fullContent,
                })
              );
            }
          } catch {
            // skip malformed tokens
          }
        }
      }

      if (pendingId && targetChatId && fullContent) {
        dispatch(
          addMessage({
            chatId: targetChatId,
            message: {
              id: `msg-${Date.now()}`,
              role: 'model',
              content: fullContent,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          })
        );
      }
    } catch (err) {
      console.error('Agent error:', err);
      const pendingMsg = activeChat?.messages.find((m) => m.isPending);
      const pendingId = pendingMsg?.id;
      if (pendingId && targetChatId) {
        dispatch(
          updateMessageContent({
            chatId: targetChatId,
            messageId: pendingId,
            content: 'Sorry, something went wrong while processing your request. Please try again.',
          })
        );
      }
    } finally {
      dispatch(setIsGenerating(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputVal);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const suggestionCards = [
    {
      text: "Write a React component using TypeScript and CSS variables",
      icon: <Code size={20} />,
      keyword: "code"
    },
    {
      text: "Give me ideas on how to build a premium UI/UX design theme",
      icon: <Lightbulb size={20} />,
      keyword: "design"
    },
    {
      text: "Explain what the Remini chat application is about",
      icon: <Compass size={20} />,
      keyword: "remini"
    },
    {
      text: "Suggest a step-by-step workflow for web applications",
      icon: <PenTool size={20} />,
      keyword: "workflow"
    }
  ];

  // Check if we show the welcome greeting (no user messages yet)
  const isWelcomeState = !activeChat || activeChat.messages.filter(m => m.role === 'user').length === 0;

  return (
    <main>
      <form action="">
        <textarea
        className='bg-gray-300'
         name="chatarea" id="chatarea"></textarea>
      </form>
      
    </main>
  );
}
