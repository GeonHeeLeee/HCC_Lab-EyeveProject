import { createSlice } from '@reduxjs/toolkit';
import { RoomName } from '../types/redux.type';

const initialState: RoomName = {
  roomName: '',
};

export const enterRoomName = createSlice({
  name: 'enterRoomName',
  initialState,
  reducers: {
    enterRoom: (state, action) => {
      state.roomName = action.payload;
    },
    exitRoom: (state) => {
      state.roomName = '';
    },
  },
});

export const { enterRoom, exitRoom } = enterRoomName.actions;

export default enterRoomName.reducer;
