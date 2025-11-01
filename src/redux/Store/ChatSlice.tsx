import {createSlice} from '@reduxjs/toolkit';

interface IChatState {
  online_users: Array<string>;
  searchResults: Array<IEvent>;
  selectedEvent: {
    name: string;
    categories: Array<IEventCategoryUIData>;
    _id: string;
    status: string;
    eventDate: string;
    progress: number; // Add progress field
    prizeType: 'INR' | 'COIN';
  } | null;
}

const initialState: IChatState = {
  online_users: [],
  searchResults: [],
  selectedEvent: null,
};

const ChatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setOnlineUsers: (state, {payload}) => {
      state.online_users = payload;
    },
    setSearchResults: (state, {payload}) => {
      state.searchResults = payload;
    },
    setSelectedEvent: (state, {payload}) => {
      state.selectedEvent = payload;
    },
  },
});

export const ChatManager = ChatSlice.reducer;
export const {setOnlineUsers, setSearchResults, setSelectedEvent} =
  ChatSlice.actions;
