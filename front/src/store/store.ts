import {configureStore} from '@reduxjs/toolkit';

import showSignupSlice from './modules/showSignupSlice';
import isLoginSlice from './modules/isLoginSlice';
import loginUserInfoReducer from './modules/loginUserInfo';
import socketSlice from './modules/socketSlice';
import networkSlice from "./modules/networkSlice";

export const store = configureStore({
  reducer: {
    showSignup: showSignupSlice,
    isLogin: isLoginSlice,
    loginUserInfo: loginUserInfoReducer,
    socket: socketSlice,
    network: networkSlice,
  },
});
