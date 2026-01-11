import React, { useState, useRef } from "react";
import { 
  Box, Typography, Button, Paper, Stack, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, InputAdornment, 
  IconButton, CircularProgress, Alert 
} from "@mui/material";

import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LogoutIcon from "@mui/icons-material/Logout";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useSelector, useDispatch } from "react-redux";
import { exportVault, importVault, fetchPasswords } from "../vaultSlice";
import { downloadCSV, parseCSV } from "../../../utils/csvUtils";

export default function VaultHeader({ onLogout }) {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.vault.items);
  const count = items?.length || 0;
  const fileInputRef = useRef(null);

  // State
  const [open, setOpen] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExportClick = async () => {
    if (!masterPassword) {
      setError("Please enter your master password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await dispatch(exportVault()).unwrap();
      downloadCSV(data);
      setOpen(false);
      setMasterPassword("");
    } catch (err) {
      setError(err || "Export failed. Is your master password correct?");
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const text = e.target.result;
        
        // 1. Parse CSV to JSON
        const parsedData = parseCSV(text); 
        console.log("Parsed Data:", parsedData);
        
        // 2. Run the Import (Encryption happens inside this thunk)
        await dispatch(importVault(parsedData)).unwrap();
        
        // 3. Refresh the list so the new items appear
        dispatch(fetchPasswords({ page: 0, size: 6 }));
        
        alert(`Successfully imported ${parsedData.length} items!`);
      } catch (err) {
        console.error(err);
        alert("Failed to parse or import CSV. Ensure the format is correct.");
      } finally {
        setLoading(false);
        event.target.value = ""; // Reset file input
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
          paddingX: 3,
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
            <ShieldOutlinedIcon sx={{ color: "primary.main", fontSize: 28 }} />
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
            startIcon={loading ? <CircularProgress size={16} /> : <FileUploadIcon />}
            sx={{ textTransform: "none" }}
            onClick={handleImportClick}
            disabled={loading}
          >
            Import
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            style={{ display: "none" }}
          />

          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpen(true)}
          >
            Export
          </Button>

          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            sx={{ textTransform: "none" }}
            onClick={onLogout}
          >
            Lock Vault
          </Button>
        </Stack>
      </Paper>

      {/* EXPORT DIALOG */}
      <Dialog 
        open={open} 
        onClose={() => !loading && setOpen(false)} 
        maxWidth="xs" 
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Confirm Export
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              WARNING: Your passwords will be downloaded in plain text.
            </Typography>
          </Alert>
          <TextField
            fullWidth
            type={showMasterPassword ? "text" : "password"}
            label="Master Password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            disabled={loading}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowMasterPassword(!showMasterPassword)} 
                    edge="end"
                  >
                    {showMasterPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleExportClick} 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? "Decrypting..." : "Export CSV"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
