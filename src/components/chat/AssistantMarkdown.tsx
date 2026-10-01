'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AssistantMarkdownProps {
  content: string;
}

/**
 * Renders the streamed assistant answer. Long unbroken strings (code, URLs)
 * are allowed to wrap so the bubble never forces horizontal scrolling.
 */
export default function AssistantMarkdown({ content }: AssistantMarkdownProps) {
  return (
    <div className="chat-prose prose prose-invert max-w-none prose-sm sm:prose-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="app-scrollbar overflow-x-auto rounded-xl border border-line bg-canvas p-4 text-[13px] leading-relaxed">
              {children}
            </pre>
          ),
          code: ({ children, className }) =>
            className ? (
              <code className={`${className} rounded-md bg-elevated px-1.5 py-0.5 text-[0.85em]`}>
                {children}
              </code>
            ) : (
              <code className="rounded-md bg-elevated px-1.5 py-0.5 text-[0.85em] font-normal text-ink">
                {children}
              </code>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
