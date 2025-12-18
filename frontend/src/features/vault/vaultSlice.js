import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:8080/api/passwords";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

// THUNKS
export const fetchPasswords = createAsyncThunk("vault/fetch", async () => {
  const response = await axios.get(API_BASE, getAuthHeader());
  return response.data;
});

export const addPassword = createAsyncThunk("vault/add", async (passwordData) => {
    const response = await axios.post(API_BASE, passwordData, getAuthHeader());
    const savedData = response.data;
    return {
        ...savedData,
        username: savedData.usernameOrEmail, // Map backend -> frontend
        url: savedData.websiteUrl,           // Map backend -> frontend
        password: passwordData.password,     // Keep the raw password from the form
    };
});

export const updatePassword = createAsyncThunk(
    "vault/update",
    async (item, { rejectWithValue }) => {
        try {
            if (!item.id) {
                throw new Error("Missing ID - cannot update database");
            }

            await axios.put(
                `${API_BASE}/${item.id}`,
                item,
                getAuthHeader()
            );
            return item;
        } catch (err) {
            console.error("Request failed inside thunk:", err);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);


export const deletePassword = createAsyncThunk("vault/delete", async ({ id, masterPasswordHash }) => {
  await axios.delete(`${API_BASE}/${id}`, {
    headers: {
      ...getAuthHeader().headers,
      "X-Master-Password": masterPasswordHash,
    },
  });
  return id;
});

const vaultSlice = createSlice({
  name: "vault",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(addPassword.fulfilled, (state, action) => {
          state.items.push(action.payload);
        })
        .addCase(updatePassword.fulfilled, (state, action) => {
          const index = state.items.findIndex((i) => i.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
        })
        .addCase(deletePassword.fulfilled, (state, action) => {
          state.items = state.items.filter((item) => item.id !== action.payload);
        });
  },
});

export default vaultSlice.reducer;

// add to the extraReducers builder:
//.addCase(fetchPasswords.fulfilled, (state, action) => {
//    state.items = action.payload;
//})
