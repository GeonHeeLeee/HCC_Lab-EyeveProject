import { configureStore } from '@reduxjs/toolkit';

import showSignupSlice from './modules/showSignupSlice';
import isLoginSlice from './modules/isLoginSlice';
import loginUserSlice from './modules/loginUserSlice';
import socketSlice from './modules/socketSlice';
import networkSlice from './modules/networkSlice';

export const store = configureStore({
  reducer: {
    showSignup: showSignupSlice,
    isLogin: isLoginSlice,
    loginUser: loginUserSlice,
    socket: socketSlice,
    network: networkSlice,
  },
});
