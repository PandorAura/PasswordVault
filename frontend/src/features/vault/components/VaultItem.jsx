import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useDispatch } from "react-redux";
import { removeItem } from "../vaultSlice";
import { sha256 } from "hash-wasm";

export default function VaultItem({ item, onEdit }) {
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [error, setError] = useState(null);

  const strengthStyles = {
    "very weak": { bg: "#FECACA", color: "#B91C1C" },
    weak: { bg: "#FFEDD5", color: "#C2410C" },
    fair: { bg: "#FEF9C3", color: "#A16207" },
    strong: { bg: "#DBEAFE", color: "#1D4ED8" },
    "very strong": { bg: "#DCFCE7", color: "#15803D" },
  };

  const handleDelete = async () => {
    if (!masterPassword) {
      setError("Master password is required");
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      const masterPasswordHash = await sha256(masterPassword);

      const response = await fetch(
        `http://localhost:8080/api/passwords/${item.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Master-Password": masterPasswordHash,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Invalid master password or delete failed");
      }

      dispatch(removeItem(item.id));
      setConfirmOpen(false);
      setMasterPassword("");
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          padding: 2.5,
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.08)",
          backgroundColor: "white",
          width: "450px",
          height: "380px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {item.title}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {item.category && <Chip label={item.category} size="small" />}
              {item.strength && (
                <Chip
                  label={item.strength}
                  size="small"
                  sx={{
                    backgroundColor:
                      strengthStyles[item.strength.toLowerCase()]?.bg,
                    color:
                      strengthStyles[item.strength.toLowerCase()]?.color,
                    textTransform: "capitalize",
                  }}
                />
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => onEdit(item)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => setConfirmOpen(true)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* BODY */}
        <Row label="Username:" value={item.username} copyValue={item.username} />

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography sx={{ width: 110, color: "text.secondary" }}>
            Password:
          </Typography>
          <Typography>
            {showPassword ? item.password : "•".repeat(12)}
          </Typography>
          <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigator.clipboard.writeText(item.password)}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>

        <Row
          label="URL:"
          value={
            item.url ? (
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
              "—"
            )
          }
        />

        <Row label="Notes:" value={item.notes || "—"} />

        <Divider sx={{ mt: "auto" }} />

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Updated: {item.updatedAt}
        </Typography>
      </Paper>

      {/* CONFIRM DELETE */}
      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Enter your <b>master password</b> to delete{" "}
            <b>{item.title}</b>.
          </Typography>

          <TextField
            fullWidth
            type={showMasterPassword ? "text" : "password"}
            label="Master Password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            disabled={deleting}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowMasterPassword(!showMasterPassword)
                    }
                  >
                    {showMasterPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* ---------- Helper ---------- */
function Row({ label, value, copyValue }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <Typography sx={{ width: 110, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ flexGrow: 1 }}>{value}</Typography>
      {copyValue && (
        <IconButton
          size="small"
          onClick={() => navigator.clipboard.writeText(copyValue)}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
