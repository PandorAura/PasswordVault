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

export default function VaultItem({ item, onEdit }) {
  const dispatch = useDispatch();

  // const currentPage = useSelector((state) => state.vault.pageInfo.currentPage);
  const { items, pageInfo } = useSelector((state) => state.vault);
  const { currentPage } = pageInfo;

  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState("");

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
      // Logic simplified: we no longer pass the masterPasswordHash
      await dispatch(deletePassword({ id: item.id })).unwrap();
      const pageToFetch = (items.length === 1 && currentPage > 0) 
      ? currentPage - 1 
      : currentPage;
      dispatch(fetchPasswords({ page: pageToFetch, size: 6 }));
      setConfirmOpen(false);
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = () => {
    if (decryptedPassword) {
      navigator.clipboard.writeText(decryptedPassword);
    } else {
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
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          backgroundColor: "white",
          width: "450px", // RESTORED
          height: "380px", // RESTORED
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

      {/* SIMPLIFIED CONFIRM DELETE */}
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
