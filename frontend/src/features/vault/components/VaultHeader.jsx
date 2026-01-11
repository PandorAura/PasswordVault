import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
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

export default function VaultHeader({ onLogout, onDeleteAccount }) {
  const dispatch = useDispatch();

  const totalStored = useSelector((state) => state.vault.pageInfo.totalElements || 0);
  const fileInputRef = useRef(null);

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
        
        const parsedData = parseCSV(text); 
        console.log("Parsed Data:", parsedData);
        
        await dispatch(importVault(parsedData)).unwrap();
        
        dispatch(fetchPasswords({ page: 0, size: 6 }));
        alert(`Successfully imported ${parsedData.length} items!`);
      } catch {
        alert("Failed to parse or import CSV. Ensure the format is correct.");
      } finally {
        setLoading(false);
        event.target.value = ""; 
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
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          padding: { xs: 1.5, sm: 2 },
          paddingX: { xs: 2, sm: 3 },
          borderRadius: 0,
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "white",
          gap: { xs: 1.5, sm: 0 },
        }}
      >
        {/* LEFT SIDE */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: { xs: 1.5, sm: 2 },
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
          }}
        >
          {/* Icon container */}
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldOutlinedIcon 
              sx={{ 
                color: "primary.main", 
                fontSize: { xs: 24, sm: 28 } 
              }} 
            />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem" },
                lineHeight: 1.2,
              }}
            >
              Password Vault
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {count} password{count !== 1 ? "s" : ""} stored
            </Typography>
          </Box>
        </Box>

        {/* RIGHT SIDE BUTTONS */}
        <Stack 
          direction={{ xs: "row", sm: "row" }} 
          spacing={{ xs: 1, sm: 2 }}
          sx={{ 
            flexShrink: 0,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={14} /> : <FileUploadIcon />}
            sx={{ 
              textTransform: "none",
              flex: { xs: 1, sm: "0 0 auto" },
              minWidth: { xs: 0, sm: "auto" },
              paddingX: { xs: 1, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "& .MuiButton-startIcon": {
                marginRight: { xs: 0.5, sm: 1 },
              },
            }}
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
            sx={{ 
              textTransform: "none",
              flex: { xs: 1, sm: "0 0 auto" },
              minWidth: { xs: 0, sm: "auto" },
              paddingX: { xs: 1, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "& .MuiButton-startIcon": {
                marginRight: { xs: 0.5, sm: 1 },
              },
            }}
            onClick={() => setOpen(true)}
            disabled={loading}
          >
            Export
          </Button>

          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            sx={{ 
              textTransform: "none",
              flex: { xs: 1, sm: "0 0 auto" },
              minWidth: { xs: 0, sm: "auto" },
              paddingX: { xs: 1, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "& .MuiButton-startIcon": {
                marginRight: { xs: 0.5, sm: 1 },
              },
            }}
            onClick={onLogout}
            disabled={loading}
          >
            Lock Vault
          </Button>
        </Stack>
      </Paper>

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
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Confirm Export</DialogTitle>
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
