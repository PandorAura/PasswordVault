import { Box } from "@mui/material";
import LoginForm from "../features/auth/LoginForm";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/check-master" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9FAFB",
        padding: 3,
      }}
    >
      <LoginForm />
    </Box>
  );
}
