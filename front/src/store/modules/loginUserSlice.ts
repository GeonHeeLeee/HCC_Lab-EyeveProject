import { createSlice } from '@reduxjs/toolkit';
import { LoginUser } from '../types/redux.type';

const initialState: LoginUser = {
  userId: '',
  userName: '',
  userType: undefined,
  roomName: null,
};

export const loginUserSlice = createSlice({
  name: 'loginUser',
  initialState,
  reducers: {
    setLoginUser: (state, action) => {
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.userType = action.payload.userType;
      state.roomName = action.payload.roomName;
    },
    sessionExpiration: (state) => {
      state = { userId: '', userName: '', userType: undefined, roomName: '' };
    },
    enterRoom: (state, action) => {
      // state = { ...state, roomName: action.payload };
      state.roomName = action.payload;
    },
  },
});

export const { setLoginUser, sessionExpiration, enterRoom } =
  loginUserSlice.actions;

export default loginUserSlice.reducer;
