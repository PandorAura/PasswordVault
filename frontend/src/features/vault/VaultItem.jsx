import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function VaultItem({ item, onEdit }) {
  const [showPassword, setShowPassword] = useState(false);

  const strengthStyles = {
    "very weak": {
      bg: "#FECACA",
      color: "#B91C1C",
    },
    weak: {
      bg: "#FFEDD5",
      color: "#C2410C",
    },
    fair: {
      bg: "#FEF9C3",
      color: "#A16207",
    },
    strong: {
      bg: "#DBEAFE",
      color: "#1D4ED8",
    },
    "very strong": {
      bg: "#DCFCE7",
      color: "#15803D",
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        padding: 2.5,
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "white",
        width: "450px",
        height: "350px",
        minHeight: "340px",
        boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 8px 16px rgba(0,0,0,0.12)",
          borderColor: "rgba(99,102,241,0.25)",
        },
      }}
    >
      {/* Top Row (Title + Actions) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {item.title}
          </Typography>

          {/* Chips */}
          <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
            {item.category && (
              <Chip
                label={item.category}
                size="small"
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#F3F4F6",
                  fontWeight: 500,
                }}
              />
            )}
            {item.strength && (
              <Chip
                label={item.strength}
                size="small"
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    strengthStyles[item.strength.toLowerCase()]?.bg ||
                    "#E5E7EB",
                  color:
                    strengthStyles[item.strength.toLowerCase()]?.color ||
                    "#374151",
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Icons (Edit/Delete) */}
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => onEdit(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Divider sx={{ marginY: 2 }} />

      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        {/* Username */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
          <Typography sx={{ width: 110, color: "text.secondary" }}>
            Username:
          </Typography>
          <Typography sx={{ fontWeight: 500 }}>{item.username}</Typography>

          <IconButton size="small" sx={{ marginLeft: 1 }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Password */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
          <Typography sx={{ width: 110, color: "text.secondary" }}>
            Password:
          </Typography>

          <Typography sx={{ fontWeight: 500 }}>
            {showPassword ? item.password : "•".repeat(12)}
          </Typography>

          <IconButton
            size="small"
            onClick={() => setShowPassword(!showPassword)}
            sx={{ marginLeft: 1 }}
          >
            {showPassword ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </IconButton>

          <IconButton size="small">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* URL */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
          <Typography sx={{ width: 110, color: "text.secondary" }}>
            URL:
          </Typography>
          {item.url ? (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#6366F1",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Visit
              </a>
              <OpenInNewIcon fontSize="small" sx={{ color: "#6366F1" }} />
            </Stack>
          ) : (
            <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
              Not provided
            </Typography>
          )}
        </Box>

        {/* Notes */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography sx={{ width: 110, color: "text.secondary" }}>
            Notes:
          </Typography>
          <Typography sx={{ marginTop: 0.5 }}>{item.notes || "—"}</Typography>
        </Box>
      </Box>

      {/* Divider + Timestamp */}
      <Divider sx={{ marginBottom: 1 }} />

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Updated: {item.updatedAt}
      </Typography>
    </Paper>
  );
}
