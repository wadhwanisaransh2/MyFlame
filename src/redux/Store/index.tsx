import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import {AuthManager} from './AuthSlice';
import {GeneralManager} from './GeneralSlice';
import {authApi} from '../api/auth';
import {chatApi} from '../api/chat';
import {profileApi} from '../api/profile';
import {postApi} from '../api/post';
import {ChatManager} from './ChatSlice';
import {NotificationManager} from './NotificationSlice';
import {coinsApi} from '../api/coins';

const reducers = combineReducers({
  AuthManager,
  GeneralManager,
  ChatManager,
  NotificationManager,
  [authApi.reducerPath]: authApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [coinsApi.reducerPath]: coinsApi.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['AuthManager'],
  blacklist: [],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      chatApi.middleware,
      authApi.middleware,
      profileApi.middleware,
      postApi.middleware,
      coinsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
const persistor = persistStore(store);

export {store, persistor};
