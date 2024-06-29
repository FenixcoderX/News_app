import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  userName: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logIn: (state, action) => {
      state.currentUser = action.payload.user; 
      state.userName = action.payload.name;
    },
    logOut: (state) => {
      state.currentUser = '';
      state.userName = '';
    },
  },
});

export const { logIn, logOut } = userSlice.actions;

export default userSlice.reducer;
