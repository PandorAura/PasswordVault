import React, { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
  Paper,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./authSlice";
import { loginRequest, registerRequest } from "./authApi";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegisterMode && !name) {
      setMessage("Please enter your name.");
      setIsSuccess(false);
      return;
    }

    if (!email || !password) {
      setMessage("Please fill in all fields.");
      setIsSuccess(false);
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      let result;
      if (isRegisterMode) {
        result = await registerRequest(name, email, password);
      } else {
        result = await loginRequest(email, password);
      }

      const { email: userEmail, token } = result;

      // Store token in localStorage
      localStorage.setItem("authToken", token);

      // Update Redux state (you can store email + token)
      dispatch(
        login({
          email: userEmail,
          token,
        })
      );

      setIsSuccess(true);
      setMessage(
        isRegisterMode ? "Registration successful!" : "Login successful!"
      );

      setTimeout(
        () =>
          isRegisterMode
            ? navigate("/create-master", { replace: true })
            : navigate("/check-master", { replace: true }),
        600
      );
    } catch (error) {
      console.error("Auth error:", error);
      setIsSuccess(false);

      if (error.response?.status === 400) {
        setMessage("Invalid credentials or data.");
      } else if (error.response?.status === 409) {
        setMessage("Email already exists.");
      } else {
        setMessage("Error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setMessage("");
    setIsSuccess(null);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        padding: 4,
        width: "100%",
        maxWidth: 440,
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "white",
        boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Header with Icon */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldOutlinedIcon sx={{ color: "#6366f1", fontSize: 32 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {isRegisterMode ? "Create an account" : "Welcome Back"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", textAlign: "center" }}
            >
              {isRegisterMode
                ? "Sign up to start securing your passwords"
                : "Sign in to access your password vault"}
            </Typography>
          </Box>

          {isRegisterMode && (
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />
          )}

          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "#6366F1",
                        backgroundColor: "rgba(99, 102, 241, 0.08)",
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {message && (
            <Alert
              severity={isSuccess ? "success" : "error"}
              sx={{
                borderRadius: "10px",
              }}
            >
              {message}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "10px",
              textTransform: "none",
              padding: "12px",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#1f1f1f",
              },
              "&:disabled": {
                backgroundColor: "#9ca3af",
              },
            }}
          >
            {isLoading
              ? isRegisterMode
                ? "Registering..."
                : "Logging in..."
              : isRegisterMode
              ? "Register"
              : "Login"}
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              cursor: "pointer",
              color: "#6366F1",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
            onClick={toggleMode}
          >
            {isRegisterMode
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Typography>
        </Stack>
      </form>
    </Paper>
  );
}
