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
      // state = {
      //   userId: action.payload.userId,
      //   userName: action.payload.userName,
      //   userType: action.payload.userType,
      //   roomName: '',
      // };

      // state.userId = action.payload.userId;
      // state.userName = action.payload.userName;
      // state.userType = action.payload.userType;
      // state.roomName = action.payload.roomName;

      return action.payload;
    },
    sessionExpiration: (state) => {
      state = { userId: '', userName: '', userType: undefined, roomName: '' };
    },
    enterRoom: (state, action) => {
      // state = { ...state, roomName: action.payload };
      state.roomName = action.payload;
    },
    leaveRoomAction: (state) => {
      state.roomName = '';
    },
  },
});

export const { setLoginUser, sessionExpiration, enterRoom, leaveRoomAction } =
  loginUserSlice.actions;

export default loginUserSlice.reducer;
