import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  isSidebarOpen: boolean;
  isGenerating: boolean;
}

const initialState: ChatState = {
  isSidebarOpen: true,
  isGenerating: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setIsGenerating } = chatSlice.actions;

export default chatSlice.reducer;