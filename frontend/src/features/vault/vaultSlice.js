import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";
import { calculatePasswordStrength } from "../../utils/passwordStregthCalculator";
import { encryptPassword, decryptPassword, getStoredKey } from "../../utils/cryptoUtils";

const API_BASE = "/api/passwords";

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

      const ek = getStoredKey();
      const rawItems = response.data.content.map((item) => ({
        ...item,
        username: item.usernameOrEmail,
        url: item.websiteUrl,
        updatedAt: item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString()
          : item.updatedAt,
      }));

      const items = ek
        ? await Promise.all(
            rawItems.map(async (item) => {
              if (item.strength) return item;
              if (!item.encryptedPassword || !item.encryptionIv) return item;
              try {
                const decryptedPwd = await decryptPassword(
                  item.encryptedPassword,
                  item.encryptionIv,
                  ek
                );
                return {
                  ...item,
                  strength: calculatePasswordStrength(decryptedPwd),
                  updatedAt: item.updatedAt || new Date().toLocaleDateString(),
                };
              } catch {
                return item;
              }
            })
          )
        : rawItems;

      return {
        items,
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
  const savedData = response.data;
  const currentDate = new Date().toLocaleDateString();

  return {
    ...savedData,
    username: savedData.usernameOrEmail,
    url: savedData.websiteUrl,
    password: passwordData.password,
    strength: calculatedStrength,
    updatedAt: savedData.updatedAt
      ? new Date(savedData.updatedAt).toLocaleDateString()
      : currentDate,
    encryptedPassword: ciphertext,
    encryptionIv: iv,
  };
});

export const updatePassword = createAsyncThunk(
  "vault/update",
  async (item, { rejectWithValue }) => {
    try {
      if (!item.id) throw new Error("Missing ID - cannot update database");

      const { ciphertext, iv } = await encryptPassword(item.password);
      const strength = calculatePasswordStrength(item.password);
      const updatedAt = new Date().toLocaleDateString();

      const payload = {
        title: item.title,
        username: item.username,
        url: item.url,
        notes: item.notes,
        category: item.category,
        encryptedPassword: ciphertext,
        encryptionIv: iv,
        strength,
      };

      const response = await apiClient.put(`${API_BASE}/${item.id}`, payload);
      return {
        ...response.data,
        username: item.username,
        url: item.url,
        password: item.password,
        strength,
        updatedAt: response.data.updatedAt
          ? new Date(response.data.updatedAt).toLocaleDateString()
          : updatedAt,
        encryptedPassword: ciphertext,
        encryptionIv: iv,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deletePassword = createAsyncThunk(
  "vault/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${API_BASE}/${id}`);
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

      const response = await apiClient.get(API_BASE, {
        params: { page: 0, size: 1000 },
      });
      const encryptedItems = response.data.content;

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
      .addCase(addPassword.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (state.items.length > state.pageInfo.size) {
          state.items.pop();
        }
      })
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
      .addCase(deletePassword.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearVault } = vaultSlice.actions;
export default vaultSlice.reducer;