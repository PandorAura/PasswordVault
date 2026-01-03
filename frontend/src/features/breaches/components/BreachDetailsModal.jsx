import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function BreachDetailsModal({
  open,
  onClose,
  breachItem,
  decryptPassword,
  getStoredKey,
}) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState("");
  const [decryptError, setDecryptError] = useState(null);

  const canShow = !!breachItem && breachItem.status === "pwned";

  const subtitle = useMemo(() => {
    if (!breachItem) return "";
    const parts = [];
    if (breachItem.username) parts.push(breachItem.username);
    if (breachItem.url) parts.push(breachItem.url);
    return parts.join(" • ");
  }, [breachItem]);

  const handleReveal = async () => {
    if (!breachItem) return;

    if (showPassword) {
      setShowPassword(false);
      return;
    }

    if (decryptedPassword) {
      setShowPassword(true);
      return;
    }

    setDecryptError(null);
    setIsDecrypting(true);
    try {
      const key = getStoredKey();
      if (!key) throw new Error("Vault is locked. Please unlock again.");

      const plain = await decryptPassword(
        breachItem.encryptedPassword,
        breachItem.encryptionIv
      );
      setDecryptedPassword(plain);
      setShowPassword(true);
    } catch (e) {
      setDecryptError(e?.message || "Failed to decrypt password.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopy = async () => {
    if (!decryptedPassword) return;
    await navigator.clipboard.writeText(decryptedPassword);
  };

  React.useEffect(() => {
    if (!open) {
      setIsDecrypting(false);
      setShowPassword(false);
      setDecryptedPassword("");
      setDecryptError(null);
      return;
    }
    setShowPassword(false);
    setDecryptedPassword("");
    setDecryptError(null);
  }, [open, breachItem?.id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Breach details
      </DialogTitle>

      <DialogContent>
        {!breachItem ? (
          <Typography sx={{ color: "text.secondary" }}>No item selected.</Typography>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {breachItem.title}
              </Typography>
              {!!subtitle && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<WarningAmberIcon />}
                color="error"
                label={`Pwned ${breachItem.count}×`}
                sx={{ fontWeight: 700 }}
              />
              <Chip label="Checked via k‑anonymity (hash prefix only)" />
            </Stack>

            <Divider />

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Breached password
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography sx={{ flexGrow: 1, fontFamily: "monospace" }}>
                  {showPassword
                    ? decryptedPassword || ""
                    : decryptedPassword
                      ? "•".repeat(Math.min(20, Math.max(12, decryptedPassword.length)))
                      : "••••••••••••"}
                </Typography>

                <IconButton
                  size="small"
                  onClick={handleReveal}
                  disabled={!canShow || isDecrypting}
                >
                  {isDecrypting ? (
                    <CircularProgress size={16} />
                  ) : showPassword ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>

                <IconButton
                  size="small"
                  onClick={handleCopy}
                  disabled={!decryptedPassword}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>

              {decryptError && (
                <Typography sx={{ mt: 1 }} color="error">
                  {decryptError}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Recommended actions
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Change this password everywhere it’s used, and avoid reusing it across sites.
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}


