import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
