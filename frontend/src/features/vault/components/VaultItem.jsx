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
import { useDispatch, useSelector } from "react-redux";
import { deletePassword, fetchPasswords } from "../vaultSlice";
import { decryptPassword, getStoredKey } from "../../../utils/cryptoUtils";
import { normalizeUrl } from "../../../utils/normalizeURL";

export default function VaultItem({ item, onEdit, onDeleteSuccess, onDeleteError }) {
  const dispatch = useDispatch();

  // const currentPage = useSelector((state) => state.vault.pageInfo.currentPage);
  const { items, pageInfo } = useSelector((state) => state.vault);
  const { currentPage } = pageInfo;

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
    setDecryptedPassword(""); 
    setShowPassword(false); 
  }, [item.encryptedPassword]);

  const strengthStyles = {
    "very weak": { bg: "#FECACA", color: "#B91C1C" },
    weak: { bg: "#FFEDD5", color: "#C2410C" },
    fair: { bg: "#FEF9C3", color: "#A16207" },
    strong: { bg: "#DBEAFE", color: "#1D4ED8" },
    "very strong": { bg: "#DCFCE7", color: "#15803D" },
  };

  const handleTogglePassword = async () => {
    if (showPassword) {
      setShowPassword(false);
      return;
    }

    if (decryptedPassword) {
      setShowPassword(true);
      return;
    }

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
    try {
      setDeleting(true);
      setError(null);
      const masterPasswordHash = await sha256(masterPassword);

      await dispatch(
        deletePassword({
          id: item.id,
          masterPasswordHash,
        })
      ).unwrap();

      setConfirmOpen(false);
      setMasterPassword("");
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      const errorMsg = err.message || "Invalid master password or delete failed";
      setError(errorMsg);
      if (onDeleteError) {
        onDeleteError(errorMsg);
      }
    } finally {
      setDeleting(false);
    }
  };
  const handleCopy = async () => {
    try {
      if (decryptedPassword) {
        await navigator.clipboard.writeText(decryptedPassword);
        setSnackbar({ open: true, message: "Password copied to clipboard!", type: "success" });
      } else {
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
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <Typography
                  component="span"
                  sx={{
                    color: "#374151",
                    fontSize: "0.9rem",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                  title={normalizeUrl(item.url)}
                >
                  {item.url}
                </Typography>

                <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <a
                    href={normalizeUrl(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "primary.main",
                      fontWeight: 500,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Visit
                  </a>
                  <OpenInNewIcon fontSize="small" sx={{ color: "primary.main" }} />
                </Box>
              </Box>
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
        <DialogTitle>Delete Password?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{item.title}</b>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Confirm Delete
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
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          component="div"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      </Box>
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
