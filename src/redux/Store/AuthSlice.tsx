import {createSlice} from '@reduxjs/toolkit';

const initialState: any = {
  access_token: null,
  refreshToken: null,
  user: {},
  onBoarding: true,
  profile: {},
  settings: {},
  coinConfig: {},
  location: {
    latitude: null,
    longitude: null,
  },
  hasNewMessage: false,
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    showOnboarding: (state, {payload}) => {
      state.onBoarding = payload;
    },
    setAuth: (state, {payload}) => {
      state.access_token = payload.access_token;
    },
    getAuthenticate: (state, {payload}) => {
      state.access_token = payload.access_token;
      state.user = payload.user;
    },
    setUserProfile: (state, {payload}) => {
      state.profile = payload;
    },
    setSettings: (state, {payload}) => {
      state.settings = payload;
    },
    resetUser: state => {
      state.access_token = null;
      state.user = {};
      state.profile = {};
      state.settings = {};
      state.location = {
        latitude: null,
        longitude: null,
      };
      state.hasNewMessage = true;
    },
    setLocation: (state, {payload}) => {
      state.location = payload;
    },
    updateCoins: (state, {payload}) => {
      state.profile = {
        ...state.profile,
        coins: payload,
      };
    },

    addCoins: (state, {payload}) => {
      state.profile = {
        ...state.profile,
        coins: state.profile.coins + payload,
      };
    },

    removeCoins: (state, {payload}) => {
      state.profile = {
        ...state.profile,
        coins: state.profile.coins - payload,
      };
    },
    setCoinConfig: (state, {payload}) => {
      state.coinConfig = payload;
    },
    setHasNewMessage: (state, {payload}) => {
      state.hasNewMessage = payload;
    },
  },
});

export const AuthManager = AuthSlice.reducer;
export const {
  getAuthenticate,
  resetUser,
  showOnboarding,
  setUserProfile,
  setAuth,
  setSettings,
  setLocation,
  updateCoins,
  addCoins,
  removeCoins,
  setCoinConfig,
  setHasNewMessage,
} = AuthSlice.actions;
