import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ChatListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'human' | 'ai';
  message: string;
  createdAt: string;
}

export interface ChatDetail {
  id: string;
  title: string;
  messages: ChatMessageItem[];
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Chats', 'Messages'],
  endpoints: (builder) => ({
    getChats: builder.query<ChatListItem[], void>({
      query: () => '/chats',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Chats' as const, id })), { type: 'Chats' as const, id: 'LIST' }]
          : [{ type: 'Chats', id: 'LIST' }],
    }),
    getChat: builder.query<ChatDetail, string>({
      query: (chatId) => `/chats/${chatId}`,
      providesTags: (_result, _error, chatId) => [{ type: 'Messages', id: chatId }],
    }),
    deleteChat: builder.mutation<{ deleted: string }, string>({
      query: (chatId) => ({ url: `/chats/${chatId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, chatId) => [
        { type: 'Chats', id: 'LIST' },
        { type: 'Messages', id: chatId },
      ],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useDeleteChatMutation,
} = baseApi;

export default baseApi;