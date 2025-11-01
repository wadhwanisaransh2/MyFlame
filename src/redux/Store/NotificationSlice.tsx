import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  // other fields
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload); // newest on top
    },
    clearNotifications: state => {
      state.notifications = [];
    },
  },
});

export const {addNotification, clearNotifications} = notificationSlice.actions;
export const NotificationManager = notificationSlice.reducer;
