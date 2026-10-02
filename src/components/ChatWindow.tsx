'use client';

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { baseApi, useGetChatQuery } from "@/lib/api/baseApi";
import { toggleSidebar } from "@/lib/features/chat/chatSlice";
import { useScrollToBottom } from "@/lib/hooks/useScrollToBottom";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import Composer from "./chat/Composer";
import ScrollToBottomButton from "./chat/ScrollToBottomButton";
import type { Attachment } from "./chat/AttachmentChip";

export default function ChatWindow({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread_id");

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const dispatch = useAppDispatch();
  const { data: chat, isFetching } = useGetChatQuery(threadId ?? "", { skip: !threadId });

  const streamedRef = useRef("");

  useEffect(() => {
    streamedRef.current = "";
    setPrompt("");
    setText("");
  }, [threadId]);

  useEffect(() => {
    if (!chat || loading) return;
    const last = chat.messages[chat.messages.length - 1];
    if (last && last.role === "ai" && last.message === streamedRef.current) {
      setPrompt("");
      setText("");
      streamedRef.current = "";
    }
  }, [chat, loading]);

  const { scrollRef, isPinned, scrollToBottom } = useScrollToBottom<HTMLDivElement>(text);

  const handleSubmit = async (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setText("");
    setQuery("");
    setPrompt(query);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: query,
        thread_id: threadId ?? "new",
        email: userEmail,
      }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let streamed = "";
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      streamed += chunk;
      setText(streamed);
    }
    setLoading(false);
    streamedRef.current = streamed;

    const createdChatId = res.headers.get("x-chat-id");
    if (createdChatId && createdChatId !== threadId) {
      router.replace(`${pathname}?thread_id=${createdChatId}`);
    }

    dispatch(baseApi.util.invalidateTags([{ type: "Chats", id: "LIST" }]));
    if (threadId) {
      dispatch(baseApi.util.invalidateTags([{ type: "Messages", id: threadId }]));
    } else if (createdChatId) {
      dispatch(baseApi.util.invalidateTags([{ type: "Messages", id: createdChatId }]));
    }
  };

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

  const messages = chat?.messages.map((message) => ({
    role: message.role === 'human' ? 'user' as const : 'model' as const,
    content: message.message,
  })) ?? [];

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-canvas">
      <ChatHeader
        title={threadId ? chat?.title ?? "New chat" : "New chat"}
        isGenerating={loading}
        onToggleSidebar={() => dispatch(toggleSidebar())}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <MessageList
          scrollRef={scrollRef}
          messages={messages}
          prompt={prompt}
          text={text}
          isLoading={loading}
          isFetchingHistory={Boolean(threadId) && isFetching}
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