'use client';

import { useState } from "react";
import { toggleSidebar } from "@/lib/features/chat/chatSlice";
import { useScrollToBottom } from "@/lib/hooks/useScrollToBottom";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import Composer from "./chat/Composer";
import ScrollToBottomButton from "./chat/ScrollToBottomButton";
import type { Attachment } from "./chat/AttachmentChip";
import { useSearchParams } from "next/navigation";

export default function ChatWindow({ userEmail }: { userEmail: string }) {
  const searchParams = useSearchParams();
  const thread_id = searchParams.get("thread_id") || 'new';

  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [prompt, setPrompt] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const dispatch = useAppDispatch();
  const title = useAppSelector((state) => {
    const chat = state.chat.chats.find((c) => c.id === state.chat.activeChatId);
    return chat?.title ?? "New chat";
  });

  const { scrollRef, isPinned, scrollToBottom } = useScrollToBottom<HTMLDivElement>(text);

  const handleSubmit = async (e?: { preventDefault: () => void }) => {
    e?.preventDefault()
    setLoading(true)
    setText("")
    setPrompt(query)

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: query,
        thread_id,
        email: userEmail
      }),
    });


    const reader = res.body?.getReader()
    const decoder = new TextDecoder();
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setText(prev => prev + chunk)
    }
    setLoading(false)

  }

  const handleAddFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: Attachment[] = Array.from(files).map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setAttachments((prev) => [...prev, ...next]);
  };

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-canvas">
      <ChatHeader title={title} isGenerating={loading} onToggleSidebar={() => dispatch(toggleSidebar())} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <MessageList
          scrollRef={scrollRef}
          prompt={prompt}
          text={text}
          isLoading={loading}
          onSelectSuggestion={setQuery}
        />

        <ScrollToBottomButton
          visible={!isPinned}
          isLoading={loading}
          onClick={() => scrollToBottom()}
        />
      </div>

      <Composer
        value={query}
        isLoading={loading}
        attachments={attachments}
        onChange={setQuery}
        onSubmit={() => handleSubmit()}
        onAddFiles={handleAddFiles}
        onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
      />
    </main>
  );
}
