import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { addMessage, addPendingMessage, updateMessageContent } from '../features/chat/chatSlice';

interface StreamChatArgs {
  chatId: string;
  prompt: string;
}

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const apiError = (status: number, message: string) => ({ error: { status, data: message } });

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Chat'],
  endpoints: (builder) => ({
    streamChat: builder.mutation<string, StreamChatArgs>({
      async queryFn({ chatId, prompt }, { signal, dispatch }) {
        const assistantId = newId('assistant');

        dispatch(
          addMessage({
            chatId,
            message: {
              id: newId('user'),
              role: 'user',
              content: prompt,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          })
        );
        dispatch(addPendingMessage({ chatId, messageId: assistantId }));

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, chatId }),
            signal,
          });

          if (!response.ok || !response.body) {
            return apiError(response.status, 'Chat request failed');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullText = '';

          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            if (!chunk) continue;

            fullText += chunk;
            dispatch(updateMessageContent({ chatId, messageId: assistantId, content: fullText }));
          }

          fullText += decoder.decode();

          return { data: fullText };
        } catch (error) {
          if (signal.aborted) {
            return apiError(499, 'Request aborted');
          }
          return apiError(500, error instanceof Error ? error.message : 'Unknown error');
        }
      },
    }),
  }),
});

export const { useStreamChatMutation } = chatApi;