import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { calculatePasswordStrength } from "../../utils/passwordStregthCalculator";
import {
  encryptPassword,
  decryptPassword,
  getStoredKey,
} from "../../utils/cryptoUtils";

const API_BASE = "/api/passwords";

/* =========================
   THUNKS
========================= */

export const fetchPasswords = createAsyncThunk(
  "vault/fetch",
  async (
    { page = 0, size = 6, search = "", category = "all" },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get(API_BASE, {
        params: { page, size, search, category },
      });

      const raw = response.data;

      const items = (raw.content ?? []).map((item) => ({
        ...item,
        username: item.usernameOrEmail,
        url: item.websiteUrl,
        updatedAt: item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString()
          : item.updatedAt,
      }));

      return {
        items,
        totalPages: raw.totalPages ?? 0,
        currentPage: raw.number ?? 0,
        totalElements: raw.totalElements ?? 0,
        size,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addPassword = createAsyncThunk(
  "vault/add",
  async (passwordData, { rejectWithValue }) => {
    try {
      let ciphertext = passwordData.encryptedPassword;
      let iv = passwordData.encryptionIv;

      // Encrypt only if we were given a raw password and no ciphertext
      if (passwordData.password && !ciphertext) {
        const encrypted = await encryptPassword(passwordData.password);
        ciphertext = encrypted.ciphertext;
        iv = encrypted.iv;
      }

      const calculatedStrength = passwordData.password
        ? calculatePasswordStrength(passwordData.password)
        : passwordData.strength;

      const payload = {
        title: passwordData.title,
        username: passwordData.username,
        url: passwordData.url,
        notes: passwordData.notes,
        category: passwordData.category,
        encryptedPassword: ciphertext,
        encryptionIv: iv,
        strength: calculatedStrength,
      };

      const response = await apiClient.post(API_BASE, payload);
      const saved = response.data;

      return {
        ...saved,
        username: saved.usernameOrEmail,
        url: saved.websiteUrl,
        password: passwordData.password, // keep plain only in UI memory if you want
        strength: calculatedStrength,
        updatedAt: saved.updatedAt
          ? new Date(saved.updatedAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        encryptedPassword: ciphertext,
        encryptionIv: iv,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

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
        strength: item.password
          ? calculatePasswordStrength(item.password)
          : item.strength,
      };

      const response = await apiClient.put(`${API_BASE}/${item.id}`, payload);
      const saved = response.data;

      return {
        ...saved,
        username: saved.usernameOrEmail ?? item.username,
        url: saved.websiteUrl ?? item.url,
        password: item.password,
        encryptedPassword: ciphertext,
        encryptionIv: iv,
        updatedAt: saved.updatedAt
          ? new Date(saved.updatedAt).toLocaleDateString()
          : item.updatedAt,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deletePassword = createAsyncThunk(
  "vault/delete",
  async ({ id, masterPasswordHash }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${API_BASE}/${id}`, {
        headers: { "X-Master-Password": masterPasswordHash },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const exportVault = createAsyncThunk(
  "vault/export",
  async (_, { rejectWithValue }) => {
    try {
      const ek = getStoredKey();
      if (!ek) throw new Error("Vault is locked. Please re-login.");

      // Fetch ALL items (bypass pagination)
      const response = await apiClient.get(API_BASE, {
        params: { page: 0, size: 1000 },
      });

      const encryptedItems = response.data.content ?? [];

      return await Promise.all(
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
        const result = await dispatch(addPassword(item)).unwrap();
        results.push(result);
      }
      return results;
    } catch (err) {
      return rejectWithValue(err.message || "Import failed");
    }
  }
);

/* =========================
   SLICE
========================= */

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
        state.pageInfo.size = action.payload.size ?? state.pageInfo.size;
      })
      .addCase(fetchPasswords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ===== ADD ===== */
      .addCase(addPassword.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (state.items.length > state.pageInfo.size) state.items.pop();
      })

      /* ===== UPDATE ===== */
      .addCase(updatePassword.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })

      /* ===== DELETE ===== */
      .addCase(deletePassword.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
        // Optional: keep totalElements in sync
        if (state.pageInfo.totalElements > 0) state.pageInfo.totalElements -= 1;
      });
  },
});

export const { clearVault } = vaultSlice.actions;
export default vaultSlice.reducer;
