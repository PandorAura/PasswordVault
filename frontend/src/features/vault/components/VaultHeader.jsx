import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";

import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LogoutIcon from "@mui/icons-material/Logout";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSelector } from "react-redux";

export default function VaultHeader({ onLogout }) {
  const items = useSelector((state) => state.vault.items);
  const count = items?.length || 0;

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderRadius: 0,
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "white",
      }}
    >
      {/* LEFT SIDE */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Icon container */}
        <Box
          sx={{
            width: 48,
            height: 48,
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldOutlinedIcon sx={{ color: "#6366f1", fontSize: 28 }} />
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Password Vault
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {count} password{count !== 1 ? "s" : ""} stored
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE BUTTONS */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          sx={{ borderRadius: "10px", textTransform: "none" }}
        >
          Import
        </Button>

        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          sx={{ borderRadius: "10px", textTransform: "none" }}
        >
          Export
        </Button>

        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          sx={{ borderRadius: "10px", textTransform: "none" }}
          onClick={onLogout}
        >
         Lock Vault
        </Button>
      </Stack>
    </Paper>
  );
}
