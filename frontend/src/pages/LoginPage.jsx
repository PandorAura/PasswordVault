import { Box } from "@mui/material";
import LoginForm from "../features/auth/LoginForm";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        padding: 3,
      }}
    >
      <LoginForm />
    </Box>
  );
}
