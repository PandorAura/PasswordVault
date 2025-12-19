import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { encryptPassword } from "../../utils/cryptoUtils";
import { calculatePasswordStrength } from "../../utils/passwordStregthCalculator";

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
  const { ciphertext, iv} = await encryptPassword(passwordData.password); 
  const payload = {
    title: passwordData.title,
    username: passwordData.username,
    url: passwordData.url,
    notes: passwordData.notes,
    category: passwordData.category,
    encryptedPassword: ciphertext,
    encryptionIv: iv
  }
  const calculatedStrength = calculatePasswordStrength(passwordData.password);
      const currentDate = new Date().toLocaleDateString();
  const response = await axios.post(API_BASE, payload, getAuthHeader());
    const savedData = response.data;
    return {
        ...response.data,
        username: savedData.usernameOrEmail, // Map backend name -> frontend name
        url: savedData.websiteUrl,           // Map backend name -> frontend name
        password: passwordData.password,
        strength: calculatedStrength,
        updatedAt: currentDate,
        encryptionIv: iv,
        encryptedPassword: ciphertext
    };
});

export const updatePassword = createAsyncThunk(
    "vault/update",
    async (item, { rejectWithValue }) => {
        try {
            if (!item.id) {
                throw new Error("Missing ID - cannot update database");
            }

            const {ciphertext, iv} = await encryptPassword(item.password);
            const payload = {
                title: item.title,
                username: item.username,
                url: item.url,
                notes: item.notes,
                category: item.category,
                encryptedPassword: ciphertext,
                encryptionIv: iv
            };
            await axios.put(
                `${API_BASE}/${item.id}`,
                payload,
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
