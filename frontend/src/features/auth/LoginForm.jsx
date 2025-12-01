import React, { useState } from "react";
import { TextField, Button, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./authSlice";
import apiClient from "../../utils/apiClient"; 

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please fill in both fields.");
      setIsSuccess(false);
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      const { token } = response.data;

      // Store token in localStorage
      localStorage.setItem("authToken", token);

      // Update Redux state (you can store email + token)
      dispatch(
        login({
          email,
          token,
        })
      );

      setIsSuccess(true);
      setMessage("Login successful!");

      // Redirect after short delay
      setTimeout(() => navigate("/vault"), 600);
    } catch (error) {
      console.error("Login error:", error);
      setIsSuccess(false);

      if (error.response && error.response.status === 400) {
        setMessage("Invalid credentials.");
      } else {
        setMessage("Error logging in. Please try again.");
      }
    } finally {
      setIsLoading(false);
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

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </Stack>
    </form>
  );
}