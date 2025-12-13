import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: !!localStorage.getItem("authToken"),
    token: localStorage.getItem("authToken"),
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
      localStorage.removeItem("authToken");
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;