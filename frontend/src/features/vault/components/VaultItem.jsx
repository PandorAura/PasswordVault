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
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useDispatch } from "react-redux";
import { deletePassword } from "../vaultSlice";
import { sha256 } from "hash-wasm";
import { decryptPassword, getStoredKey } from "../../../utils/cryptoUtils";
import { normalizeUrl } from "../../../utils/normalizeURL";

export default function VaultItem({ item, onEdit }) {
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState("");

  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  React.useEffect(() => {
    setDecryptedPassword(""); // Clear the old password from memory
    setShowPassword(false); // Hide the dots again
  }, [item.encryptedPassword]);

  const strengthStyles = {
    "very weak": { bg: "#FECACA", color: "#B91C1C" },
    weak: { bg: "#FFEDD5", color: "#C2410C" },
    fair: { bg: "#FEF9C3", color: "#A16207" },
    strong: { bg: "#DBEAFE", color: "#1D4ED8" },
    "very strong": { bg: "#DCFCE7", color: "#15803D" },
  };
  // --- Handle Decryption for Display ---
  const handleTogglePassword = async () => {
    if (showPassword) {
      setShowPassword(false);
      return;
    }

    // If we already decrypted it once, just show it
    if (decryptedPassword) {
      setShowPassword(true);
      return;
    }

    // Otherwise, decrypt it now
    setIsDecrypting(true);
    const ek = getStoredKey();
    if (!ek) {
      alert("Vault is locked. Please refresh and unlock.");
      setIsDecrypting(false);
      return;
    }

    const result = await decryptPassword(
      item.encryptedPassword,
      item.encryptionIv,
      ek
    );
    setDecryptedPassword(result);
    setShowPassword(true);
    setIsDecrypting(false);
  };
  const handleDelete = async () => {
    if (!masterPassword) {
      setError("Master password is required");
      return;
    }

    try {
      setDeleting(true);
      const masterPasswordHash = await sha256(masterPassword);

      // Call the Redux Thunk
      await dispatch(
        deletePassword({
          id: item.id,
          masterPasswordHash,
        })
      ).unwrap();

      setConfirmOpen(false);
      setMasterPassword("");
    } catch (err) {
      setError(err.message || "Invalid master password or delete failed");
    } finally {
      setDeleting(false);
    }
  };
  const handleCopy = async () => {
    try {
      // If visible, copy decrypted. If hidden but we have it, copy decrypted.
      // If hidden and we don't have it, we must decrypt first (optional UX)
      if (decryptedPassword) {
        await navigator.clipboard.writeText(decryptedPassword);
        setSnackbar({ open: true, message: "Password copied to clipboard!", type: "success" });
      } else {
        // Auto-decrypt and copy
        const ek = getStoredKey();
        if (ek) {
          const res = await decryptPassword(item.encryptedPassword, item.encryptionIv, ek);
          setDecryptedPassword(res);
          await navigator.clipboard.writeText(res);
          setSnackbar({ open: true, message: "Password copied to clipboard!", type: "success" });
        }
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to copy password", type: "error" });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          padding: 2.5,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          backgroundColor: "white",
          width: "100%",
          height: "380px",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease-in-out",
          cursor: "pointer",
          "&:hover": {
            elevation: 4,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-4px)",
            borderColor: "white",
            borderWidth: "0.1px",
          },
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
                    color: strengthStyles[item.strength.toLowerCase()]?.color,
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
        <Row
          label="Username:"
          value={item.username}
          copyValue={item.username}
          onCopy={(message, type) => setSnackbar({ 
            open: true, 
            message: message, 
            type: type 
          })}
        />

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography sx={{ width: 110, color: "text.secondary" }}>
            Password:
          </Typography>
          <Typography>
            {showPassword ? decryptedPassword : "•".repeat(12)}
          </Typography>
          <IconButton
            size="small"
            onClick={handleTogglePassword}
            disabled={isDecrypting}
          >
            {isDecrypting ? (
              <CircularProgress size={16} />
            ) : showPassword ? (
              <VisibilityOffIcon />
            ) : (
              <VisibilityIcon />
            )}{" "}
          </IconButton>
          <IconButton size="small" onClick={handleCopy}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>

        <Row
          label="URL:"
          value={
            item.url ? (
              <Stack direction="row" spacing={1} alignItems="center">
                {/* URL text */}
                <span
                  style={{
                    color: "#374151",
                    fontSize: "0.9rem",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={normalizeUrl(item.url)}
                >
                  {item.url}
                </span>

                {/* Visit button */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <a
                    href={normalizeUrl(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "primary.main",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Visit
                  </a>
                  <OpenInNewIcon fontSize="small" sx={{ color: "primary.main" }} />
                </Stack>
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

      {/* SNACKBAR NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: { xs: "16px", sm: "24px" },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.type}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 3,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            "& .MuiAlert-icon": {
              fontSize: "1.25rem",
            },
            ...(snackbar.type === "success" && {
              backgroundColor: "#6366F1",
              "&:hover": {
                backgroundColor: "#5855eb",
              },
            }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* CONFIRM DELETE */}
      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
      >
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Enter your <b>master password</b> to delete <b>{item.title}</b>.
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
                    onClick={() => setShowMasterPassword(!showMasterPassword)}
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
function Row({ label, value, copyValue, onCopy }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      if (onCopy) {
        onCopy("Username copied to clipboard!", "success");
      }
    } catch {
      if (onCopy) {
        onCopy("Failed to copy to clipboard", "error");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <Typography sx={{ width: 110, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ flexGrow: 1 }}>{value}</Typography>
      {copyValue && (
        <IconButton
          size="small"
          onClick={handleCopy}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
