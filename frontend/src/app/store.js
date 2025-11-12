import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import vaultReducer from "../features/vault/vaultSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    vault: vaultReducer,
  },
});

export default store;
