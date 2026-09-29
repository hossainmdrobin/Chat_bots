'use client';

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatWindow() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setText("")

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: query,
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

  return (
    <main className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {text}
      </ReactMarkdown>
      <form onSubmit={handleSubmit}>
        <textarea
          onChange={(e) => setQuery(e.target.value)}
          className='bg-gray-300 rounded'
          name="chatarea" id="chatarea"></textarea>
        <button>Submit</button>
      </form>
    </main>
  );
}
