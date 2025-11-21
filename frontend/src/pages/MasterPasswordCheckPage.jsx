import { Box, Paper, Typography, Avatar } from "@mui/material";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { MasterPasswordCheckForm } from "../features/auth/MasterPasswordCheckForm";
import { useNavigate } from "react-router-dom";

export default function MasterPasswordCheckPage() {
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
          padding: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <SecurityOutlinedIcon sx={{ fontSize: 32, color: "white" }} />
          </Avatar>
        </Box>

        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "text.primary",
            marginBottom: 1,
          }}
        >
          Unlock Your Vault
        </Typography>

        <Typography
          variant="body1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 400,
            color: "text.secondary",
            marginBottom: 3,
          }}
        >
          Enter your Master Password to decrypt your data for this session.
        </Typography>

        <MasterPasswordCheckForm onSuccess={handleSuccess} />
      </Paper>
    </Box>
  );
}
