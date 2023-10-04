import { createSlice } from '@reduxjs/toolkit';
import {LoginUsername} from "../types/redux.type";

const initialState: LoginUsername = {
  username: '',
};

export const loginUsernameSlice = createSlice({
  name: 'loginUsername',
  initialState,
  reducers: {
    setLoginUsername: (state, action) => {
      state.username = action.payload;
    },
    sessionExpiration: (state) => {
      state.username = '';
    },
  },
});

export const { setLoginUsername, sessionExpiration } =
  loginUsernameSlice.actions;

export default loginUsernameSlice.reducer;
