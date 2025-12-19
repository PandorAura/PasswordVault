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
import { deletePassword } from "../vaultSlice";
import { sha256 } from "hash-wasm";
import { decryptPassword, getStoredKey } from "../../../utils/cryptoUtils";

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
  const handleCopy = () => {
    // If visible, copy decrypted. If hidden but we have it, copy decrypted.
    // If hidden and we don't have it, we must decrypt first (optional UX)
    if (decryptedPassword) {
      navigator.clipboard.writeText(decryptedPassword);
    } else {
      // Auto-decrypt and copy
      const ek = getStoredKey();
      if (ek) {
        decryptPassword(item.encryptedPassword, item.encryptionIv, ek).then(
          (res) => {
            setDecryptedPassword(res);
            navigator.clipboard.writeText(res);
          }
        );
      }
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
