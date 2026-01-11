import { createSlice } from "@reduxjs/toolkit";

function isJwtExpired(token) {
  if (!token) return true;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    const exp = payload?.exp;
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

const storedToken = localStorage.getItem("authToken");
const initialToken = storedToken && !isJwtExpired(storedToken) ? storedToken : null;
if (storedToken && !initialToken) {
  localStorage.removeItem("authToken");
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: !!initialToken,
    token: initialToken,
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