import { createSlice } from "@reduxjs/toolkit";

const vaultSlice = createSlice({
  name: "vault",
  initialState: {
    items: [],
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },
    editItem: (state, action) => {
      const updated = action.payload;
      const index = state.items.findIndex(i => i.id === updated.id);
      if (index !== -1) {
        state.items[index] = updated;
      }
    },
  },
});

export const { addItem, removeItem, editItem } = vaultSlice.actions;
export default vaultSlice.reducer;
