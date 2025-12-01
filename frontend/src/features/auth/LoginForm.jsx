import React, { useState } from "react";
import { TextField, Button, Alert, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./authSlice";
import { loginRequest, registerRequest } from "./authApi";

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      setTimeout(() => navigate("/vault"), 600);
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
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="h5" textAlign="center">
          {isRegisterMode ? "Create an account" : "Login"}
        </Typography>

        {isRegisterMode && (
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <Alert severity={isSuccess ? "success" : "error"}>
            {message}
          </Alert>
        )}

        <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
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
          sx={{ cursor: "pointer" }}
          onClick={toggleMode}
        >
          {isRegisterMode
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Typography>
      </Stack>
    </form>
  );
}