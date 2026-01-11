import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { calculatePasswordStrength } from "../../utils/passwordStregthCalculator";
import { encryptPassword, decryptPassword, getStoredKey } from "../../utils/cryptoUtils";

const API_BASE = "http://localhost:8080/api/passwords";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

// --- THUNKS ---

export const fetchPasswords = createAsyncThunk(
  "vault/fetch",
  async ({ page = 0, size = 6 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_BASE, {
        ...getAuthHeader(),
        params: { page, size },
      });

      return {
        items: response.data.content.map((item) => ({
          ...item,
          username: item.usernameOrEmail,
          url: item.websiteUrl,
        })),
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        totalElements: response.data.totalElements,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addPassword = createAsyncThunk("vault/add", async (passwordData) => {
  let ciphertext = passwordData.encryptedPassword;
  let iv = passwordData.encryptionIv;
  // Only encrypt if we were passed a raw 'password' field
  if (passwordData.password && !ciphertext) {
      const encrypted = await encryptPassword(passwordData.password);
      ciphertext = encrypted.ciphertext;
      iv = encrypted.iv;
  }
  const payload = {
    title: passwordData.title,
    username: passwordData.username,
    url: passwordData.url,
    notes: passwordData.notes,
    category: passwordData.category,
    encryptedPassword: ciphertext,
    encryptionIv: iv,
  };
  const calculatedStrength = calculatePasswordStrength(passwordData.password);
  const currentDate = new Date().toLocaleDateString();
  const response = await axios.post(API_BASE, payload, getAuthHeader());
  const savedData = response.data;
  return {
    ...savedData,
    username: savedData.usernameOrEmail,
    url: savedData.websiteUrl,
    password: passwordData.password,
    strength: calculatedStrength,
    updatedAt: currentDate,
    encryptionIv: iv,
    encryptedPassword: ciphertext,
  };
});

export const updatePassword = createAsyncThunk(
  "vault/update",
  async (item, { rejectWithValue }) => {
    try {
      if (!item.id) throw new Error("Missing ID - cannot update database");

      const { ciphertext, iv } = await encryptPassword(item.password);
      const payload = {
        title: item.title,
        username: item.username,
        url: item.url,
        notes: item.notes,
        category: item.category,
        encryptedPassword: ciphertext,
        encryptionIv: iv,
      };
      const response = await axios.put(`${API_BASE}/${item.id}`, payload, getAuthHeader());
      return {
        ...response.data,
        username: item.username,
        url: item.url,
        password: item.password,
        encryptedPassword: ciphertext,
        encryptionIv: iv,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// MODIFIED: Simplified delete (removed masterPasswordHash)
export const deletePassword = createAsyncThunk(
  "vault/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// --- SLICE ---

export const exportVault = createAsyncThunk(
  "vault/export",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const ek = getStoredKey();

      if (!ek) throw new Error("Vault is locked. Please re-login.");

      // 1. Fetch ALL passwords (size=1000 to bypass pagination)
      const response = await axios.get(`${API_BASE}?page=0&size=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const encryptedItems = response.data.content;

      // 2. Decrypt locally
      const decryptedData = await Promise.all(
        encryptedItems.map(async (item) => {
          const decryptedPwd = await decryptPassword(
            item.encryptedPassword,
            item.encryptionIv,
            ek
          );
          return {
            title: item.title,
            username: item.usernameOrEmail,
            password: decryptedPwd,
            url: item.websiteUrl,
            category: item.category,
            notes: item.notes || "",
          };
        })
      );

      return decryptedData; // This goes to the component
    } catch (err) {
      return rejectWithValue(err.message || "Export failed");
    }
  }
);


export const importVault = createAsyncThunk(
  "vault/import",
  async (items, { dispatch, rejectWithValue }) => {
    try {
      const results = [];
      for (const item of items) {
        if (!item.password || !item.title) continue;

        // Just pass the raw item; addPassword will handle encryption
        const result = await dispatch(addPassword(item)).unwrap();
        results.push(result);
      }
      return results;
    } catch (err) {
      return rejectWithValue(err.message || "Import failed");
    }
  }
);


const vaultSlice = createSlice({
  name: "vault",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    pageInfo: {
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 6,
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
        currentPage: 0,
        size: 6,
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
        state.items = action.payload.items;
        state.pageInfo.totalPages = action.payload.totalPages;
        state.pageInfo.currentPage = action.payload.currentPage;
        state.pageInfo.totalElements = action.payload.totalElements;
      })
      .addCase(fetchPasswords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ===== ADD ===== */
      .addCase(addPassword.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        // Uses state.pageInfo.size (6) to keep grid consistent
        if (state.items.length > state.pageInfo.size) {
          state.items.pop();
        }
      })

      /* ===== UPDATE ===== */
      .addCase(updatePassword.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
          };
        }
      })

      /* ===== DELETE ===== */
      .addCase(deletePassword.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearVault } = vaultSlice.actions;
export default vaultSlice.reducer;