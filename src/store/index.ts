import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appsReducer from './slices/appsSlice';
import subscriptionReducer from './slices/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    apps: appsReducer,
    subscription: subscriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
