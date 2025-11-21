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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const MOCK_PASSWORD = "master-password";

    if (password === MOCK_PASSWORD) {
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) onSuccess();
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError("Incorrect Master Password. Please try again.");
      }, 1000);
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
