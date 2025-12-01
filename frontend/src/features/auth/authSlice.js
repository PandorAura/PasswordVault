import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    token: null, // NEW: store JWT token if you want to use it from Redux. Aveti de grija dragi prieteni si cititi pe aicia
  },
  reducers: {
    login: (state, action) => {
      // - { email, token }   
      const { email, token, ...rest } = action.payload || {};

      // keep backward compatibility: user is still an object with at least email
      state.user = {
        ...(state.user || {}),
        ...rest,
        ...(email ? { email } : {}),
      };

      state.isAuthenticated = true;

      // if a token is provided, store it in state
      if (token) {
        state.token = token;
      } else {
        state.token = null;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;