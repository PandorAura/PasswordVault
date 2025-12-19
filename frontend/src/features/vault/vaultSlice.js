import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:8080/api/passwords";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

// THUNKS
export const fetchPasswords = createAsyncThunk(
    "vault/fetch",
    async ({ page = 0, size = 6 }, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_BASE, {
                ...getAuthHeader(),
                params: { page, size },
            });

            // We return the metadata (totalPages, number) + the content
            return {
                items: response.data.content.map(item => ({
                    ...item,
                    username: item.usernameOrEmail,
                    url: item.websiteUrl
                })),
                totalPages: response.data.totalPages, // CRITICAL
                currentPage: response.data.number,    // CRITICAL
            };
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

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
  initialState: {
    items: [],
    status: "idle",
    error: null,
    pageInfo: {
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
    },
  },
  reducers: {
    clearVault(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.pageInfo = {
        totalElements: 0,
        totalPages: 0,
        page: 0,
        size: 10,
      };
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== FETCH ===== */
      .addCase(fetchPasswords.pending, (state) => {
        state.status = "loading";
      })
        .addCase(fetchPasswords.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.items = action.payload.items; // Just the 6 items for this page
            state.pageInfo.totalPages = action.payload.totalPages;
            state.pageInfo.currentPage = action.payload.currentPage;
        })
      .addCase(fetchPasswords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ===== ADD ===== */
      .addCase(addPassword.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* ===== UPDATE ===== */
      .addCase(updatePassword.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
      })

      /* ===== DELETE ===== */
      .addCase(deletePassword.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );
      });
  },
});

export const { clearVault } = vaultSlice.actions;
export default vaultSlice.reducer;