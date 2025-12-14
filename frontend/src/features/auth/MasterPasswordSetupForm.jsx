import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  LinearProgress,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { calculatePasswordStrength } from "../../utils/passwordStregthCalculator";
import {
  generateSalt,
  deriveSecrets,
  setStoredKey,
} from "../../utils/cryptoUtils";

export default function MasterPasswordSetupForm({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState({
    text: "",
    score: 0,
  });

  const handleClickShowPassword = (field) => {
    if (field === "master") {
      setShowPassword((show) => !show);
    }
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length > 0) {
      const strengthText = calculatePasswordStrength(newPassword);
      let strengthScore = 0;
      if (strengthText === "Very Weak") strengthScore = 1;
      else if (strengthText === "Weak") strengthScore = 2;
      else if (strengthText === "Fair") strengthScore = 3;
      else if (strengthText === "Strong") strengthScore = 4;
      else if (strengthText === "Very Strong") strengthScore = 5;
      setStrength({ text: strengthText, score: strengthScore });
    } else {
      setStrength({ text: "", score: 0 });
    }
  };

  const getStrengthColor = (score) => {
    if (score <= 1) return "error";
    if (score === 2) return "warning";
    if (score === 3) return "secondary";
    if (score >= 4) return "success";
    return "grey";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match. Please ensure both fields are identical."
      );
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      // 1. Generate Salt
      const salt = generateSalt();

      // 2. Run Argon2 (Heavy calculation)
      // This gives us the EK (keep local) and AH (send to server)
      const { authHash, encryptionKey } = await deriveSecrets(password, salt);

      // 3. Send to your NEW endpoint
      // Note: User must already be logged in (have a JWT) for this to work
      const response = await fetch("http://localhost:8080/api/vault/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salt: salt,
          authHash: authHash,
        }),
      });

      if (!response.ok) throw new Error("Vault setup failed");

      setStoredKey(encryptionKey);

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
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
          onChange={handlePasswordChange}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleClickShowPassword("master")}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {password.length > 0 && (
          <Box sx={{ width: "100%", mt: -1.5, mb: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={(strength.score / 5) * 100}
              color={getStrengthColor(strength.score)}
              sx={{ height: 6, borderRadius: 5 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              Strength:{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{ fontWeight: "bold" }}
                color={getStrengthColor(strength.score)}
              >
                {strength.text}
              </Typography>
            </Typography>
          </Box>
        )}
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          error={
            !isLoading &&
            confirmPassword.length > 0 &&
            password !== confirmPassword
          }
          helperText={
            !isLoading &&
            confirmPassword.length > 0 &&
            password !== confirmPassword
              ? "Passwords do not match"
              : null
          }
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: 1.5,
            borderRadius: 1,
            backgroundColor: (theme) => theme.palette.action.hover,
          }}
        >
          <WarningIcon fontSize="small" />
          <Typography variant="caption" color="text.secondary">
            Remember this password! It cannot be recovered if lost. All your
            passwords are encrypted with it.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={
            isLoading ||
            password.length === 0 ||
            confirmPassword.length === 0 ||
            password !== confirmPassword
          }
        >
          {isLoading ? "Creating Vault..." : "Create Vault"}
        </Button>
      </Stack>
    </form>
  );
}
