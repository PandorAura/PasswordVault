import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Alert,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function DeleteAccountDialog({ open, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canDelete = useMemo(
    () =>
      confirmText.trim().toUpperCase() === "DELETE" &&
      masterPassword.trim().length > 0,
    [confirmText, masterPassword]
  );

  const handleClose = () => {
    setConfirmText("");
    setMasterPassword("");
    setShowMasterPassword(false);
    setSubmitting(false);
    setError(null);
    onClose?.();
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await onConfirm?.({ masterPassword });
      setConfirmText("");
      setMasterPassword("");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to delete account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete account</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            This action is permanent. Your account, vault metadata, and stored
            passwords will be deleted.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Type <b>DELETE</b> to confirm.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "DELETE"'
            disabled={submitting}
          />

          <Typography variant="body2" color="text.secondary">
            Enter your <b>master password</b> to confirm deletion.
          </Typography>

          <TextField
            fullWidth
            type={showMasterPassword ? "text" : "password"}
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Master password"
            disabled={submitting}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowMasterPassword((v) => !v)}
                    edge="end"
                    aria-label="toggle password visibility"
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

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!canDelete}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          Delete permanently
        </Button>
      </DialogActions>
    </Dialog>
  );
}

