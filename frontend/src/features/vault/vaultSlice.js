import { createSlice } from "@reduxjs/toolkit";

const vaultSlice = createSlice({
  name: "vault",
  initialState: {
    items: [
      {
        id: 1,
        title: "Google Account",
        category: "General",
        strength: "Very Weak",
        username: "john.doe",
        password: "mypassword123",
        url: "https://google.com",
        notes: "Recovery email: johnbackup@gmail.com",
        updatedAt: "11/13/2025",
      },
      {
        id: 2,
        title: "GitHub",
        category: "Work",
        strength: "Weak",
        username: "johndev",
        password: "supersecure",
        url: "https://github.com",
        notes: "2FA enabled",
        updatedAt: "11/12/2025",
      },
      {
        id: 3,
        title: "Bank Account",
        category: "Banking",
        strength: "Strong",
        username: "john.bank",
        password: "bankpass321",
        url: "https://mybank.com",
        notes: "",
        updatedAt: "11/10/2025",
      },
      {
        id: 4,
        title: "Bank Account",
        category: "Banking",
        strength: "Fair",
        username: "john.bank",
        password: "bankpass321",
        url: "https://mybank.com",
        notes: "",
        updatedAt: "11/10/2025",
      },
      {
        id: 5,
        title: "Bank Account",
        category: "Banking",
        strength: "Very Strong",
        username: "john.bank",
        password: "bankpass321",
        url: "https://mybank.com",
        notes: "",
        updatedAt: "11/10/2025",
      },
    ],
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    editItem: (state, action) => {
      const updated = action.payload;
      const index = state.items.findIndex(i => i.id === updated.id);
      if (index !== -1) {
        state.items[index] = updated;
      }
    }
  },
});

export const { addItem, removeItem, editItem } = vaultSlice.actions;

export default vaultSlice.reducer;
