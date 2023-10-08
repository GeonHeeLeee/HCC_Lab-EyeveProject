import { createSlice } from '@reduxjs/toolkit';
import { SocketState } from '../types/redux.type';

const initialState: SocketState = {
  socket: null,
  otherSockets: [],
};

export const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload.socket;
    },
    clearSocket: (state) => {
      state.socket = null;
    },
  },
});

export const { setSocket, clearSocket } = socketSlice.actions;
export default socketSlice.reducer;
