import { Box, Paper, Typography, Avatar } from "@mui/material";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import MasterPasswordSetupForm from "../features/auth/MasterPasswordSetupForm";
import { useNavigate } from "react-router-dom";

export default function MasterPasswordSetupPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/vault");
  };

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
          padding: 8,
          width: "100%",
          maxWidth: 650,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <SecurityOutlinedIcon sx={{ fontSize: 32, color: "white" }} />
          </Avatar>
        </Box>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 500,
            color: "text.primary",
            marginBottom: 2,
          }}
        >
          Create Your Password Vault
        </Typography>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 300,
            color: "text.secondary",
            marginBottom: 4,
          }}
        >
          Set up a strong master password to secure your vault
        </Typography>
        <MasterPasswordSetupForm onSuccess={handleSuccess} />
      </Paper>
    </Box>
  );
}
