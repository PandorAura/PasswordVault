// src/features/auth/LoginForm.jsx
import React, { useState } from "react";
import { TextField, Button, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./authSlice";

// Hardcoded credentials
const VALID_EMAIL = "user@example.com";
const VALID_PASSWORD = "user";

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please fill in both fields.");
      setIsSuccess(false);
      return;
    }

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setMessage("Login successful!");
      setIsSuccess(true);

      dispatch(
        login({
          email,
        })
      );

      setTimeout(() => navigate("/vault"), 600);
    } else {
      setMessage("Incorrect email or password.");
      setIsSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
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
          <Alert
            severity={isSuccess ? "success" : "error"}
            sx={{ borderRadius: 2 }}
          >
            {message}
          </Alert>
        )}

        <Button type="submit" variant="contained" size="large" fullWidth>
          Login
        </Button>
      </Stack>
    </form>
  );
}
