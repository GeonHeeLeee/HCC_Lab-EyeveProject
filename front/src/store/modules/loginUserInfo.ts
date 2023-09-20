import {createSlice} from '@reduxjs/toolkit';
import {UserInfo} from "../types/redux.type";

const initialState: UserInfo = {
  username: '',
  userId: '',
  userType: undefined,
};

export const loginUserInfo = createSlice({
  name: 'loginUserInfo',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      state.userType = action.payload.userType;
    },
    sessionExpiration: (state) => {
      state.username = '';
      state.userId = '';
      state.userType = undefined;
    },
  },
});

export const {setUserInfo, sessionExpiration} =
    loginUserInfo.actions;

export default loginUserInfo.reducer;
