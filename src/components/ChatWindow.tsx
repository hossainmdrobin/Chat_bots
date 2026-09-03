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
    <main className="main-chat-window">
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <button 
            className="mobile-menu-btn" 
            onClick={() => dispatch(toggleSidebar())}
            title="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="model-selector">
            <span>DeepAgent</span>
            <span className="model-version">LangGraph</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="header-right">
          <button className="icon-btn" title="Share chat">
            <Share size={18} />
          </button>
          <div className="user-profile-avatar" title="User Settings">
            R
          </div>
        </div>
      </header>

      {/* Messages / Welcome viewport */}
      <div className="messages-container">
        <div className="scroll-content">
          {isWelcomeState ? (
            <div className="welcome-panel">
              <div className="greeting-container">
                <h1 className="greeting-text">Hello, Robin</h1>
                <h2 className="greeting-sub">How can I help you today?</h2>
              </div>
              
              <div className="suggestions-grid">
                {suggestionCards.map((card, idx) => (
                  <div 
                    key={idx} 
                    className="suggestion-card"
                    onClick={() => handleSubmit(card.text)}
                  >
                    <span className="suggestion-text">{card.text}</span>
                    <div className="suggestion-icon-wrap">
                      {card.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Message List
            activeChat.messages.map((message, index) => {
              const isLastMessage = index === activeChat.messages.length - 1;
              const shouldAnimate = isLastMessage && message.role === 'model' && !message.isPending && !typedMessageIds[message.id];

              return (
                <div key={message.id} className={`message-item ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'model' ? (
                      <div className="message-avatar-gemini" />
                    ) : (
                      'R'
                    )}
                  </div>
                  
                  <div className="message-content-wrapper">
                    {message.isPending ? (
                      <div className="pending-shimmer-container">
                        <div className="shimmer-line w-full" />
                        <div className="shimmer-line w-80" />
                        <div className="shimmer-line w-60" />
                      </div>
                    ) : shouldAnimate ? (
                      <Typewriter 
                        text={message.content} 
                        onComplete={() => {
                          setTypedMessageIds(prev => ({ ...prev, [message.id]: true }));
                        }}
                      />
                    ) : (
                      <div 
                        className="message-content" 
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} 
                      />
                    )}

                    {!message.isPending && message.role === 'model' && (
                      <div className="message-actions">
                        <button 
                          className="action-icon-btn" 
                          onClick={() => handleCopy(message.content)} 
                          title="Copy text"
                        >
                          <Copy size={14} />
                        </button>
                        <button className="action-icon-btn" title="Good response">
                          <ThumbsUp size={14} />
                        </button>
                        <button className="action-icon-btn" title="Bad response">
                          <ThumbsDown size={14} />
                        </button>
                        <button 
                          className="action-icon-btn" 
                          onClick={() => handleSubmit(activeChat.messages[index - 1]?.content || '')}
                          title="Regenerate"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input container */}
      <div className="input-area-container">
        <div className="input-box-wrapper">
          <div className="input-box">
            <div className="input-row">
              <textarea
                ref={textareaRef}
                className="prompt-textarea"
                placeholder="Enter a prompt here"
                rows={1}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
              />
              
              <div className="input-actions">
                <button className="icon-btn" title="Upload image mockup" disabled={isGenerating}>
                  <ImageIcon size={20} />
                </button>
                <button className="icon-btn" title="Voice input mockup" disabled={isGenerating}>
                  <Mic size={20} />
                </button>
                <button 
                  className={`send-btn ${inputVal.trim() && !isGenerating ? 'active' : ''}`}
                  onClick={() => handleSubmit(inputVal)}
                  disabled={!inputVal.trim() || isGenerating}
                  title="Send message"
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="disclaimer-text">
            DeepAgent may display inaccurate info. Verify important information independently.
          </div>
        </div>
      </div>
    </main>
  );
}
