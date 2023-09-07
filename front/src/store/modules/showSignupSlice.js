import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: false,
};

export const showSignupSlice = createSlice({
  name: 'showSignup',
  initialState,
  reducers: {
    show: (state) => {
      state.value = true;
    },
    hide: (state) => {
      state.value = false;
    },
  },
});

export const { show, hide } = showSignupSlice.actions;

export default showSignupSlice.reducer;
