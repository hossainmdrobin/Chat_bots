import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './features/chat/chatSlice';
import { chatApi } from './api/chatApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      chat: chatReducer,
      [chatApi.reducerPath]: chatApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(chatApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];