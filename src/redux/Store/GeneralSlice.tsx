import {createSlice} from '@reduxjs/toolkit';

type states = {
  notificationCount: number | string;
};

const initialState: states = {
  notificationCount: 0,
};

const generalSlice = createSlice({
  name: 'general',
  initialState: initialState,
  reducers: {
    setNotificationCount: (state, {payload}) => {
      state.notificationCount = payload;
    },
  },
});

export const GeneralManager = generalSlice.reducer;

export const {setNotificationCount} = generalSlice.actions;
