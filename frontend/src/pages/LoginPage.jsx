import { Box, Paper, Typography } from "@mui/material";
import LoginForm from "../features/auth/LoginForm";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/vault" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            marginBottom: 3,
          }}
        >
          Welcome Back
        </Typography>

        <LoginForm />
      </Paper>
    </Box>
  );
}