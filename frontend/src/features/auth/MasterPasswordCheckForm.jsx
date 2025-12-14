import React, { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { deriveSecrets, setStoredKey } from "../../utils/cryptoUtils";

export function MasterPasswordCheckForm({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const getUserEmailFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
      // Decode the payload (2nd part of JWT)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload).sub;
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const email = getUserEmailFromToken();

      if (!token || !email) {
        throw new Error("Session expired. Please log in again.");
      }

      // 1. Fetch the Salt and AuthHash from the server
      // We need these to verify the password locally
      const response = await fetch(
        `http://localhost:8080/api/vault/params?email=${email}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Vault not set up yet.");
        }
        throw new Error("Failed to retrieve vault parameters.");
      }

      const { salt, authHash: serverAuthHash } = await response.json();

      // 2. Run the heavy calculation (Argon2)
      // This regenerates the keys based on what the user just typed
      const { authHash: calculatedAuthHash, encryptionKey } =
        await deriveSecrets(password, salt);

      // 3. Client-Side Verification
      // We compare what we just calculated vs what the server has stored
      if (calculatedAuthHash === serverAuthHash) {
        // Save the Encryption Key to RAM so the app can decrypt data
        setStoredKey(encryptionKey);
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Incorrect Master Password.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      // If verification failed, make sure no key is stored
      setStoredKey(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Master Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading || password.length === 0}
        >
          {isLoading ? "Unlocking..." : "Unlock Vault"}
        </Button>
      </Stack>
    </form>
  );
}
